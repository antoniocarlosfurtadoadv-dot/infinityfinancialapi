import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { IoGuard } from 'src/features/auth/guards/io.guard';
import { UserPayload } from 'src/shared/interfaces';
import { ScanSessionStoreService } from '../services/scan-session-store.service';

interface AuthenticatedSocket extends Socket {
  user?: UserPayload;
}

/** Metadata stored per-socket to avoid re-validating on every message */
interface DesktopMeta {
  role: 'desktop';
  userId: string;
  tenantId: string | null;
  sessionId?: string;
}

interface MobileMeta {
  role: 'mobile';
  sessionId: string;
}

type SocketMeta = DesktopMeta | MobileMeta;

const socketMeta = new Map<string, SocketMeta>();

@WebSocketGateway({
  namespace: '/scan',
  cors: { origin: '*' },
})
export class ScanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly ioGuard: IoGuard,
    private readonly scanSessionStore: ScanSessionStoreService,
  ) {}

  // ─── Connection lifecycle ────────────────────────────────────────────────

  async handleConnection(client: AuthenticatedSocket) {
    const auth = client.handshake.auth as Record<string, string | undefined>;

    // ── Mobile client: identifies by sessionId + sessionToken ──
    if (auth.sessionId && auth.sessionToken) {
      const session = this.scanSessionStore.findByToken(
        auth.sessionId,
        auth.sessionToken,
      );

      if (!session) {
        client.emit('scan:error', {
          message: 'Sessão inválida ou expirada. Escaneie o QR code novamente.',
        });
        client.disconnect(true);
        return;
      }

      socketMeta.set(client.id, {
        role: 'mobile',
        sessionId: session.sessionId,
      });

      await client.join(`scan:${session.sessionId}`);
      return;
    }

    // ── Desktop client: identifies by JWT ──
    const token = auth.token;
    if (!token) {
      client.emit('scan:error', { message: 'Token ausente.' });
      client.disconnect(true);
      return;
    }

    try {
      const user = await this.ioGuard.checkToken(token);
      client.user = user;

      socketMeta.set(client.id, {
        role: 'desktop',
        userId: user.id,
        tenantId: user.tenantId,
      });
    } catch {
      client.emit('scan:error', { message: 'Token inválido.' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    socketMeta.delete(client.id);
  }

  // ─── Events ──────────────────────────────────────────────────────────────

  /**
   * Desktop emits this after connecting to subscribe to a specific session's events.
   * Payload: { sessionId: string }
   */
  @SubscribeMessage('scan:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    const meta = socketMeta.get(client.id);
    if (!meta || meta.role !== 'desktop') return;

    const session = this.scanSessionStore.findById(data.sessionId);
    if (!session) {
      client.emit('scan:error', { message: 'Sessão não encontrada.' });
      return;
    }

    // Security: only the user who created the session can join it
    if (session.userId !== meta.userId) {
      client.emit('scan:error', { message: 'Acesso negado.' });
      return;
    }

    if (session.expiresAt < new Date()) {
      client.emit('scan:error', {
        message: 'Sessão expirada. Gere um novo QR code.',
      });
      return;
    }

    await client.join(`scan:${session.sessionId}`);
    (meta as DesktopMeta).sessionId = session.sessionId;

    // Send any codes already scanned (mobile was faster than desktop join)
    for (const code of session.codes) {
      client.emit('scan:code', { code });
    }
  }

  /**
   * Mobile emits this for each barcode it reads.
   * Payload: { code: string }
   */
  @SubscribeMessage('scan:code')
  handleCode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { code: string },
  ) {
    const meta = socketMeta.get(client.id);
    if (!meta || meta.role !== 'mobile') return;

    const code = (data.code ?? '').trim();
    if (!code) return;

    const added = this.scanSessionStore.addCode(meta.sessionId, code);
    if (!added) {
      client.emit('scan:error', {
        message: 'Sessão expirada. Escaneie o QR code novamente.',
      });
      return;
    }

    this.server.to(`scan:${meta.sessionId}`).emit('scan:code', { code });
  }

  /**
   * Mobile emits this when the user presses "Concluir leitura".
   */
  @SubscribeMessage('scan:submit')
  handleSubmit(@ConnectedSocket() client: Socket) {
    const meta = socketMeta.get(client.id);
    if (!meta || meta.role !== 'mobile') return;

    const session = this.scanSessionStore.markSubmitted(meta.sessionId);
    if (!session) return;

    this.server.to(`scan:${meta.sessionId}`).emit('scan:submitted', {
      codes: session.codes,
    });
  }
}

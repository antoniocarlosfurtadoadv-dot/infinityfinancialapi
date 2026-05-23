import { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';


import type * as NotificationInterfaces from '../interfaces/notification.interface';
import { UserPayload } from 'src/shared/interfaces';
import { IoGuard } from 'src/features/auth/guards/io.guard';

// Extended Socket interface with user data
interface AuthenticatedSocket extends Socket {
  user?: UserPayload;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Em produção, especifique domínios permitidos
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(private readonly ioGuard: IoGuard) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client attempting connection: ${client.id}`);

    try {
      // Get token from auth handshake
      const token = client.handshake?.auth?.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Validate token and get user payload
      const user = await this.ioGuard.checkToken(token);
      client.user = user;

      this.logger.log(`Client connected: ${client.id}, User: ${user.id}`);

      // Auto-register user with their userId from token
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)!.add(client.id);

      // Join user-specific room
      client.join(`user:${user.id}`);

      // Auto-join tenant room if user has tenantId
      if (user.tenantId) {
        client.join(`tenant:${user.tenantId}`);
        this.logger.log(
          `User ${user.id} auto-joined tenant room: ${user.tenantId}`,
        );
      }

      // Emit successful authentication
      client.emit('authenticated', {
        success: true,
        userId: user.id,
        tenantId: user.tenantId,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Authentication failed for client ${client.id}: ${message}`,
      );
      client.emit('error', {
        message: 'Authentication failed',
        error: message,
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove o socket de todos os usuários
    this.userSockets.forEach((sockets, userId) => {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    });
  }

  /**
   * Cliente se registra com seu userId (now uses authenticated user from token)
   * This is kept for backwards compatibility but now validates against token
   */
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const authenticatedUser = client.user;

    if (!authenticatedUser) {
      this.logger.warn(
        `Unauthenticated register attempt from socket ${client.id}`,
      );
      return { success: false, message: 'Not authenticated' };
    }

    // Use the userId from the token, not from client data
    const userId = authenticatedUser.id;

    // Warn if client tries to register with different userId
    if (data.userId && data.userId !== userId) {
      this.logger.warn(
        `Client ${client.id} tried to register as ${data.userId} but token says ${userId}`,
      );
    }

    this.logger.log(`User ${userId} registered with socket ${client.id}`);

    // User should already be registered from handleConnection, but ensure it
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    // Adiciona o cliente a uma sala específica do usuário
    client.join(`user:${userId}`);

    return {
      success: true,
      message: 'Registered successfully',
      userId: userId,
      tenantId: authenticatedUser.tenantId,
    };
  }

  /**
   * Cliente entra em uma sala de equipe
   */
  @SubscribeMessage('joinTeam')
  handleJoinTeam(
    @MessageBody() data: { teamId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { success: false, message: 'Not authenticated' };
    }

    const { teamId } = data;
    this.logger.log(
      `User ${client.user.id} (socket ${client.id}) joined team room: ${teamId}`,
    );
    client.join(`team:${teamId}`);

    return { success: true, message: `Joined team ${teamId}` };
  }

  /**
   * Cliente sai de uma sala de equipe
   */
  @SubscribeMessage('leaveTeam')
  handleLeaveTeam(
    @MessageBody() data: { teamId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { success: false, message: 'Not authenticated' };
    }

    const { teamId } = data;
    this.logger.log(
      `User ${client.user.id} (socket ${client.id}) left team room: ${teamId}`,
    );
    client.leave(`team:${teamId}`);

    return { success: true, message: `Left team ${teamId}` };
  }

  /**
   * Cliente entra em uma sala de empresa
   */
  @SubscribeMessage('joinTenant')
  handleJoinTenant(
    @MessageBody() data: { tenantId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { success: false, message: 'Not authenticated' };
    }

    const { tenantId } = data;
    this.logger.log(
      `User ${client.user.id} (socket ${client.id}) joined tenant room: ${tenantId}`,
    );
    client.join(`tenant:${tenantId}`);

    return { success: true, message: `Joined tenant ${tenantId}` };
  }

  /**
   * Envia notificação para um usuário específico
   */
  sendToUser(
    userId: string,
    notification: NotificationInterfaces.NotificationPayload,
  ) {
    this.logger.log(`Sending notification to user ${userId}`);

    //check if user is connected
    if (!this.isUserConnected(userId)) {
      this.logger.warn(
        `User ${userId} is not connected. Notification not sent.`,
      );
      return;
    } else {
      this.logger.log(`User ${userId} is connected. Sending notification.`);
    }

    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  /**
   * Envia notificação para todos os membros de uma equipe
   */
  sendToTeam(
    teamId: string,
    notification: NotificationInterfaces.NotificationPayload,
  ) {
    this.logger.log(`Sending notification to team ${teamId}`);
    this.server.to(`team:${teamId}`).emit('notification', notification);
  }

  /**
   * Envia notificação para todos os usuários de uma empresa
   */
  sendToTenant(
    tenantId: string,
    notification: NotificationInterfaces.NotificationPayload,
  ) {
    this.logger.log(`Sending notification to tenant ${tenantId}`);
    this.server.to(`tenant:${tenantId}`).emit('notification', notification);
  }

  /**
   * Broadcast para todos os clientes conectados
   */
  broadcast(notification: NotificationInterfaces.NotificationPayload) {
    this.logger.log('Broadcasting notification to all clients');
    this.server.emit('notification', notification);
  }

  /**
   * Obtém quantidade de usuários conectados
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Verifica se um usuário está conectado
   */
  isUserConnected(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets !== undefined && sockets.size > 0;
  }
}

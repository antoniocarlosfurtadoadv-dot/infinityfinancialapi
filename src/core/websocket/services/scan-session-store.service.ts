import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface ScanSession {
  sessionId: string;
  sessionToken: string;
  requestId: string;
  userId: string;
  codes: string[];
  expiresAt: Date;
  submittedAt?: Date;
}

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // clean every 5 minutes

@Injectable()
export class ScanSessionStoreService implements OnModuleDestroy {
  private readonly sessions = new Map<string, ScanSession>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(
      () => this.cleanExpired(),
      CLEANUP_INTERVAL_MS,
    );
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }

  create(requestId: string, userId: string): ScanSession {
    const session: ScanSession = {
      sessionId: randomUUID(),
      sessionToken: randomUUID(),
      requestId,
      userId,
      codes: [],
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  findById(sessionId: string): ScanSession | undefined {
    return this.sessions.get(sessionId);
  }

  /** Validates the short-lived token used by the mobile client */
  findByToken(sessionId: string, sessionToken: string): ScanSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    if (session.sessionToken !== sessionToken) return undefined;
    if (session.expiresAt < new Date()) return undefined;
    return session;
  }

  addCode(sessionId: string, code: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < new Date()) return false;
    if (!session.codes.includes(code)) {
      session.codes.push(code);
    }
    return true;
  }

  markSubmitted(sessionId: string): ScanSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    session.submittedAt = new Date();
    return session;
  }

  private cleanExpired(): void {
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
      }
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

import { QueueService } from '../../queue/services/queue.service';
import { EVENT_NAMES } from '../constants/event-names.constant';
import { FirstAccessResendEvent } from '../events/first-access-resend.event';
import { PasswordChangedEvent } from '../events/password-changed.event';
import { UserDeletedEvent } from '../events/user-deleted.event';
import { UserUpdatedEvent } from '../events/user-updated.event';
import * as UserEvents from '../interfaces/user-event.interface';

@Injectable()
export class UserListener {
  private readonly logger = new Logger(UserListener.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent(EVENT_NAMES.USER_CREATED)
  async handleUserCreated(payload: UserEvents.UserCreatedEvent) {
    this.logger.log(`User created: ${payload.name} (${payload.email})`);

    this.logger.debug(`Payload details: ${JSON.stringify(payload)}`);

    // Send welcome email with credentials
    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    const loginUrl = payload.firstAccessToken
      ? `${appUrl}/first-access?token=${payload.firstAccessToken}`
      : `${appUrl}/login`;

    await this.queueService.addEmailJob({
      to: payload.email,
      subject: 'Welcome to Atlas Ecolab - Your Account Credentials',
      template: 'user-welcome',
      context: {
        userName: payload.name,
        userEmail: payload.email,
        password: payload.password,
        companyName: payload.tenantId ? undefined : 'Atlas Ecolab',
        loginUrl,
        logoUrl:
          'https://pub-00365c6f18d64e1f962879394176d9e9.r2.dev/public/Logo%20(1).png',
      },
    });

    // Create log entry

    await this.queueService.addLogJob({
      action: 'USER_CREATED',
      entity: 'User',
      entityId: payload.userId,
      userId: payload.createdByUserId,
      tenantId: payload.tenantId,
      metadata: {
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    });
  }

  @OnEvent(EVENT_NAMES.PASSWORD_CHANGED)
  async handlePasswordChanged(payload: PasswordChangedEvent) {
    this.logger.log(
      `Password changed for user: ${payload.name} (${payload.email})${payload.isFirstTimeChange ? ' - First time' : ''}`,
    );

    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );

    await this.queueService.addEmailJob({
      to: payload.email,
      subject: 'Sua senha foi atualizada com sucesso',
      template: 'password-changed',
      context: {
        userName: payload.name,
        accessTime: payload.timestamp.toLocaleString('pt-BR'),
        deviceInfo: payload.userAgent,
        ipAddress: payload.ipAddress,
        securityUrl: `${appUrl}/login`,
      },
    });

    // Create log entry for password change

    await this.queueService.addLogJob({
      action: payload.isFirstTimeChange
        ? 'PASSWORD_CHANGED_FIRST_TIME'
        : 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: payload.userId,
      userId: payload.userId,
      tenantId: payload.tenantId,
      metadata: {
        email: payload.email,
        name: payload.name,
        firstTimeChange: payload.isFirstTimeChange,
      },
    });
  }

  @OnEvent(EVENT_NAMES.USER_DELETED)
  async handleUserDeleted(payload: UserDeletedEvent) {
    this.logger.log(`User deleted: ${payload.name} (${payload.email})`);

    await this.queueService.addEmailJob({
      to: payload.email,
      subject: 'Sua conta foi desativada',
      template: 'account-deleted',
      context: {
        userName: payload.name,
      },
    });
  }

  @OnEvent(EVENT_NAMES.USER_UPDATED)
  async handleUserUpdated(payload: UserUpdatedEvent) {
    this.logger.log(`User updated: ${payload.name} (${payload.userId})`);

    await this.queueService.addLogJob({
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: payload.userId,
      userId: payload.updatedByUserId,
      tenantId: payload.tenantId,
      metadata: {
        name: payload.name,
        changes: payload.changes,
      },
    });
  }

  @OnEvent(EVENT_NAMES.FIRST_ACCESS_RESEND)
  async handleFirstAccessResend(payload: FirstAccessResendEvent) {
    this.logger.log(`First access resend: ${payload.name} (${payload.email})`);

    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    const loginUrl = `${appUrl}/first-access?token=${payload.firstAccessToken}`;

    await this.queueService.addEmailJob({
      to: payload.email,
      subject: 'Atlas Ecolab - Novo link de primeiro acesso',
      template: 'user-welcome',
      context: {
        userName: payload.name,
        userEmail: payload.email,
        password: payload.password,
        companyName: payload.tenantId ? undefined : 'Atlas Ecolab',
        loginUrl,
        logoUrl:
          'https://pub-00365c6f18d64e1f962879394176d9e9.r2.dev/public/Logo%20(1).png',
      },
    });

    await this.queueService.addLogJob({
      action: 'FIRST_ACCESS_RESEND',
      entity: 'User',
      entityId: payload.userId,
      tenantId: payload.tenantId,
      metadata: {
        email: payload.email,
        name: payload.name,
      },
    });
  }
}

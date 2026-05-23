import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

import { QueueService } from '../../queue/services/queue.service';
import { EVENT_NAMES } from '../constants/event-names.constant';
import { VerificationCodeEmailEvent, PasswordResetEvent } from '../events';
import { NewDeviceAccessEvent } from '../events/new-device-access.event';

@Injectable()
export class AuthListener {
  private readonly logger = new Logger(AuthListener.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent(EVENT_NAMES.VERIFICATION_CODE_EMAIL)
  async handleVerificationCodeEmail(payload: VerificationCodeEmailEvent) {
    this.logger.log(`Sending verification code email to: ${payload.email}`);

    await this.queueService.addEmailJob({
      to: payload.email,
      subject: 'Your login verification code',
      template: 'verification-code',
      context: {
        userName: payload.userName,
        code: payload.code,
      },
    });
  }

  @OnEvent(EVENT_NAMES.PASSWORD_RESET)
  async handlePasswordReset(payload: PasswordResetEvent) {
    this.logger.log(`Sending password reset email to: ${payload.email}`);

    await this.queueService.addEmailJob({
      to: payload.email,
      subject: 'Requisição de redefinição de senha',
      template: 'password-reset',
      context: {
        name: payload.name,
        code: payload.code,
        codeArray: payload.code.split(''),
      },
    });

    // Create log entry for password reset request
    await this.queueService.addLogJob({
      action: 'PASSWORD_RESET_REQUESTED',
      entity: 'User',
      entityId: payload.email, // Using email as identifier since we don't have userId in the event
      metadata: {
        email: payload.email,
        name: payload.name,
      },
    });
  }

  @OnEvent(EVENT_NAMES.NEW_DEVICE_ACCESS)
  async handleNewDeviceAccess(payload: NewDeviceAccessEvent) {
    this.logger.log(`New device access detected for: ${payload.email}`);

    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );

    // The listener stays side-effect only: detection happens in auth.service.
    await this.queueService.addEmailJob({
      to: payload.email,
      subject: 'Novo acesso detectado na sua conta',
      template: 'new-device-access',
      context: {
        userName: payload.name,
        deviceInfo: payload.deviceLabel,
        accessTime: payload.timestamp.toLocaleString('pt-BR'),
        ipAddress: payload.ipAddress,
        securityUrl: `${appUrl}/login`,
      },
    });
  }
}

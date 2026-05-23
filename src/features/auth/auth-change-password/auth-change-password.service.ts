import * as bcrypt from 'bcryptjs';

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { EventDispatcherService } from 'src/core/events';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import { PasswordChangedEvent } from 'src/core/events/events/password-changed.event';
import { AuthDeviceContext } from 'src/features/auth/interfaces/auth-device-context.interface';

@Injectable()
export class AuthChangePasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    deviceContext?: AuthDeviceContext,
  ): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      throw new BadRequestException('A senha atual está incorreta');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException(
        'A nova senha deve ser diferente das senhas anteriores.',
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed, mustChangePassword: false },
    });

    // Dispatch event - listener will handle logging
    this.eventDispatcher.dispatch(
      EVENT_NAMES.PASSWORD_CHANGED,
      new PasswordChangedEvent(
        user.id,
        user.email,
        user.name,
        false,
        deviceContext?.userAgent,
        deviceContext?.ipAddress,
        user.tenantId ?? undefined,
      ),
    );
  }
}

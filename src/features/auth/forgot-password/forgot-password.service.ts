import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import {
  EventDispatcherService,
  EVENT_NAMES,
  PasswordResetEvent,
} from 'src/core/events';

import { hashToken } from '../utils/crypto.utils';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async forgotPassword(forgotPasswordDto: { email: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: forgotPasswordDto.email,
        deletedAt: null,
      },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      // Silent return to prevent email enumeration
      return { message: 'Se o e-mail existir, um código será enviado.' };
    }

    // Generate a unique reset token (UUID-like)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Generate a random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Hash both the token and code before storing
    const hashedToken = hashToken(resetToken);
    const hashedCode = hashToken(code);

    // Delete any existing unused password reset tokens for this user
    await this.prisma.userToken.deleteMany({
      where: { userId: user.id, used: false, type: 'FORGOT_PASSWORD' },
    });

    // Store the hashed token and code with an expiration time (15 minutes)
    await this.prisma.userToken.create({
      data: {
        userId: user.id,
        type: 'FORGOT_PASSWORD',
        token: hashedToken,
        code: hashedCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // Emit an event to send the email with the code
    this.eventDispatcher.dispatch(
      EVENT_NAMES.PASSWORD_RESET,
      new PasswordResetEvent(user.email, code, user.name),
    );

    // Return the plain resetToken (not hashed) for the client to use
    return { resetToken };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetToken, newPassword } = resetPasswordDto;

    // Hash the provided token to look up in the database
    const hashedToken = hashToken(resetToken);

    // Find the reset token record
    const resetRecord = await this.prisma.userToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (
      !resetRecord ||
      resetRecord.used ||
      resetRecord.user.deletedAt ||
      resetRecord.type !== 'FORGOT_PASSWORD'
    ) {
      throw new UnauthorizedException('Código inválido ou expirado');
    }

    // Check if token has expired
    if (resetRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Token de reset expirado');
    }

    // Ensure the code was already verified in the previous step
    if (!resetRecord.codeVerified) {
      throw new UnauthorizedException('Código não verificado');
    }

    // Check if new password is the same as the current password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      resetRecord.user.password,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'A nova senha deve ser diferente das senhas anteriores.',
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password, clear mustChangePassword, and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword, mustChangePassword: false },
      }),
      this.prisma.userToken.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return { success: true };
  }
}

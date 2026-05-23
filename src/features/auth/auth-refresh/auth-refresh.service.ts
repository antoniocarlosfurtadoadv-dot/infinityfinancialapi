import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';

import { AuthService } from '../auth.service';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { AuthDeviceContext } from '../interfaces/auth-device-context.interface';

@Injectable()
export class AuthRefreshService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  /** Rotate: revoke consumed token and issue a fresh pair */
  async refresh(userId: string, refreshTokenId: string): Promise<AuthResponse> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id: refreshTokenId },
      include: {
        user: {
          include: {
            roleProfile: true,
          },
        },
      },
    });

    if (
      !refreshToken ||
      refreshToken.userId !== userId ||
      refreshToken.user.deletedAt
    ) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    await this.prisma.refreshToken.update({
      where: { id: refreshTokenId },
      data: { revoked: true },
    });

    const user = refreshToken.user;

    // Preserve the original session fingerprint when rotating tokens.
    const deviceContext: AuthDeviceContext = {
      userAgent: refreshToken.userAgent ?? undefined,
      ipAddress: refreshToken.ipAddress ?? undefined,
    };

    return this.authService.generateAuthResponse(user, deviceContext);
  }

  /** Revoke all active sessions for this user */
  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}

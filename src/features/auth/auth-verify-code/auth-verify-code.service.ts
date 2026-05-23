import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';

import { hashToken } from '../utils/crypto.utils';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Injectable()
export class AuthVerifyCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyCode(dto: VerifyCodeDto): Promise<{ verified: boolean }> {
    const hashedToken = hashToken(dto.resetToken);
    const hashedCode = hashToken(dto.code);

    const resetRecord = await this.prisma.userToken.findUnique({
      where: { token: hashedToken },
    });

    if (!resetRecord || resetRecord.used || resetRecord.type !== 'FORGOT_PASSWORD') {
      throw new UnauthorizedException('Código inválido ou expirado');
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Código expirado');
    }

    if (resetRecord.code !== hashedCode) {
      throw new UnauthorizedException('Código inválido');
    }

    await this.prisma.userToken.update({
      where: { id: resetRecord.id },
      data: { codeVerified: true },
    });

    return { verified: true };
  }
}

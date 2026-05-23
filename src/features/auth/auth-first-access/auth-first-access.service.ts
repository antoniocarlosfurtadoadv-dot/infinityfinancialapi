import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import { FirstAccessResendEvent } from 'src/core/events/events/first-access-resend.event';
import { EventDispatcherService } from 'src/core/events/services/event-dispatcher.service';
import { hashToken } from '../utils/crypto.utils';
import { FirstAccessCompleteDto } from './dto/first-access-complete.dto';
import { FirstAccessRequestDto } from './dto/first-access-request.dto';
import { FirstAccessValidateDto } from './dto/first-access-validate.dto';
import { FirstAccessVerifyDto } from './dto/first-access-verify.dto';

@Injectable()
export class AuthFirstAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async request(dto: FirstAccessRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roleProfile: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const newPlainPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await this.prisma.userToken.deleteMany({
      where: { userId: user.id, type: 'FIRST_ACCESS', used: false },
    });

    const newPlainToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.userToken.create({
      data: {
        userId: user.id,
        type: 'FIRST_ACCESS',
        token: hashToken(newPlainToken),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    this.eventDispatcher.dispatch(
      EVENT_NAMES.FIRST_ACCESS_RESEND,
      new FirstAccessResendEvent(
        user.id,
        user.email,
        user.name,
        user.roleProfile?.name ?? 'UNKNOWN',
        newPlainPassword,
        user.tenantId ?? undefined,
        newPlainToken,
      ),
    );

    return { success: true };
  }

  async validate(dto: FirstAccessValidateDto) {
    const record = await this.findValidToken(dto.token);

    return {
      email: record.user.email,
      name: record.user.name,
    };
  }

  async verify(dto: FirstAccessVerifyDto) {
    if (!dto.termsAccepted) {
      throw new BadRequestException('Você precisa aceitar os termos para continuar');
    }

    const record = await this.findValidToken(dto.token);

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      record.user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha temporária incorreta');
    }

    return { verified: true };
  }

  async complete(dto: FirstAccessCompleteDto) {
    const record = await this.findValidToken(dto.token);

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: {
          password: hashedPassword,
          mustChangePassword: false,
        },
      }),
      this.prisma.userToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return { success: true };
  }

  private async findValidToken(plainToken: string) {
    const hashed = hashToken(plainToken);

    const record = await this.prisma.userToken.findUnique({
      where: { token: hashed },
      include: { user: true },
    });

    if (!record || record.used || record.type !== 'FIRST_ACCESS' || record.user.deletedAt) {
      throw new UnauthorizedException('Link inválido ou expirado');
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Link expirado. Solicite um novo ao administrador');
    }

    return record;
  }
}

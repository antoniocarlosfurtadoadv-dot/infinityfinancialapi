import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import { FirstAccessResendEvent } from 'src/core/events/events/first-access-resend.event';
import { EventDispatcherService } from 'src/core/events';
import { hashToken } from 'src/features/auth/utils/crypto.utils';

@Injectable()
export class UserResendFirstAccessLinkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async resend(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { roleProfile: true },
    });

    if (!user) {
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
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
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
}

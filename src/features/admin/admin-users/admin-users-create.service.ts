import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import { EventDispatcherService } from 'src/core/events';
import { UserCreatedEvent } from 'src/core/events/events/user-created.event';
import { hashToken } from 'src/features/auth/utils/crypto.utils';

import { CreateAdminUserDto } from './dto/create-admin-user.dto';

@Injectable()
export class AdminUsersCreateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async create(dto: CreateAdminUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException('E-mail já está em uso');
    }

    if (existing?.deletedAt) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: { email: `${existing.email}__deleted__${existing.id}` },
      });
    }

    if (dto.roleProfileId) {
      const roleProfile = await this.prisma.roleProfile.findUnique({
        where: { id: dto.roleProfileId },
      });
      if (!roleProfile) {
        throw new NotFoundException('Perfil de função não encontrado');
      }
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        roleProfileId: dto.roleProfileId ?? null,
        tenantId: null, // super-admin: no tenant
        mustChangePassword: true,
      },
    });

    const plainToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.userToken.create({
      data: {
        userId: user.id,
        type: 'FIRST_ACCESS',
        token: hashToken(plainToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    this.eventDispatcher.dispatch(
      EVENT_NAMES.USER_CREATED,
      new UserCreatedEvent(
        user.id,
        user.email,
        user.name,
        'SUPER_ADMIN',
        randomPassword,
        undefined,
        plainToken,
        user.id,
      ),
    );

    return user;
  }
}

import * as bcrypt from 'bcryptjs';

import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { EventDispatcherService } from 'src/core/events';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import { UserUpdatedEvent } from 'src/core/events/events/user-updated.event';
import { UserPayload } from 'src/shared/interfaces';

import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserUpdateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  private buildDeletedEmailAlias(email: string, userId: string) {
    return `${email}__deleted__${userId}`;
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    currentUser: UserPayload,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        tenant: true,
        roleProfile: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (currentUser.role === 'MASTER') {
      if (user.tenantId !== currentUser.tenantId) {
        throw new ForbiddenException(
          'You can only update users from your tenant',
        );
      }
    }

    // ── Security check: roleProfileId must exist ──
    if (updateUserDto.roleProfileId) {
      const roleProfile = await this.prisma.roleProfile.findUnique({
        where: { id: updateUserDto.roleProfileId },
      });

      if (!roleProfile) {
        throw new NotFoundException('Perfil de função não encontrado');
      }
    }

    // ── Check email uniqueness if changing email ──
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && !existingUser.deletedAt) {
        throw new ConflictException('E-mail já está em uso');
      }

      if (existingUser?.deletedAt) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            email: this.buildDeletedEmailAlias(
              existingUser.email,
              existingUser.id,
            ),
          },
        });
      }
    }

    // ── Hash password if provided ──
    let hashedPassword: string | undefined;
    if (updateUserDto.password) {
      const isSamePassword = await bcrypt.compare(
        updateUserDto.password,
        user.password,
      );
      if (isSamePassword) {
        throw new BadRequestException(
          'A nova senha deve ser diferente das senhas anteriores.',
        );
      }
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      // ── Build User update data ──
      const updateData: Record<string, any> = {};

      if (updateUserDto.email !== undefined) updateData.email = updateUserDto.email;
      if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
      if (updateUserDto.roleProfileId !== undefined) updateData.roleProfileId = updateUserDto.roleProfileId;
      if (hashedPassword) updateData.password = hashedPassword;

      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      // ── Re-fetch updated user with relations ──
      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          roleProfileId: true,
          roleProfile: { select: { name: true } },
          tenantId: true,
          createdAt: true,
          tenant: { select: { id: true, name: true } },
        },
      });
    });

    this.eventDispatcher.dispatch(
      EVENT_NAMES.USER_UPDATED,
      new UserUpdatedEvent(
        updatedUser.id,
        updatedUser.name,
        currentUser.id,
        updatedUser.tenantId ?? undefined,
        updateUserDto,
      ),
    );

    return updatedUser;
  }
}

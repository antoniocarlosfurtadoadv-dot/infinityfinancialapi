import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import { UserCreatedEvent } from 'src/core/events/events/user-created.event';
import { EventDispatcherService } from 'src/core/events';
import { UserPayload } from 'src/shared/interfaces';
import { hashToken } from 'src/features/auth/utils/crypto.utils';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserCreateService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  private buildDeletedEmailAlias(email: string, userId: string) {
    return `${email}__deleted__${userId}`;
  }

  async create(createUserDto: CreateUserDto, currentUser: UserPayload) {
    const loggedInUser = await this.prismaService.user.findUnique({
      where: { id: currentUser.id },
      include: { tenant: true },
    });

    if (!loggedInUser) {
      throw new ConflictException('Usuário logado não encontrado');
    }

    // ── Security check: roleProfileType must match the actual role profile ──
    const roleProfile = await this.prismaService.roleProfile.findUnique({
      where: { id: createUserDto.roleProfileId },
    });

    if (!roleProfile) {
      throw new NotFoundException('Perfil de função não encontrado');
    }

    // ── Check for duplicate email ──
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser && !existingUser.deletedAt) {
      throw new ConflictException('E-mail já está em uso');
    }

    if (existingUser?.deletedAt) {
      await this.prismaService.user.update({
        where: { id: existingUser.id },
        data: {
          email: this.buildDeletedEmailAlias(
            existingUser.email,
            existingUser.id,
          ),
        },
      });
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const result = await this.prismaService.$transaction(async (tx) => {
      // ── Create the User record ──
      const user = await tx.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
          password: hashedPassword,
          roleProfileId: createUserDto.roleProfileId,
          tenantId: loggedInUser.tenantId,
        },
      });

      return user;
    });

    this.eventDispatcher.dispatch(
      EVENT_NAMES.USER_CREATED,
      new UserCreatedEvent(
        result.id,
        result.email,
        result.name,
        roleProfile.name ?? 'UNKNOWN',
        randomPassword,
        loggedInUser.tenantId ?? undefined,
        await this.createFirstAccessToken(result.id),
        currentUser.id,
      ),
    );

    return result;
  }

  private async createFirstAccessToken(userId: string): Promise<string> {
    const plainToken = crypto.randomBytes(32).toString('hex');
    await this.prismaService.userToken.deleteMany({
      where: { userId, type: 'FIRST_ACCESS', used: false },
    });
    await this.prismaService.userToken.create({
      data: {
        userId,
        type: 'FIRST_ACCESS',
        token: hashToken(plainToken),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    return plainToken;
  }
}

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EVENT_NAMES, EventDispatcherService, UserDeletedEvent } from 'src/core/events';
import { PrismaService } from 'src/core/database/prisma.service';

import type { UserPayload } from 'src/shared/interfaces';

@Injectable()
export class UserDeleteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  // Generates a unique alias to free the original email for reuse.
  private buildDeletedEmailAlias(email: string, userId: string) {
    return `${email}__deleted__${userId}`;
  }

  async delete(userId: string, currentUser: UserPayload) {
    // Find the user
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Cannot delete yourself
    if (user.id === currentUser.id) {
      throw new BadRequestException('Você não pode excluir a si mesmo');
    }

    const deletedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt,
          // Keep historical uniqueness while releasing the original email.
          email: this.buildDeletedEmailAlias(user.email, user.id),
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revoked: false,
        },
        data: { revoked: true },
      }),
      this.prisma.userToken.updateMany({
        where: {
          userId,
          used: false,
        },
        data: { used: true },
      }),
    ]);

    this.eventDispatcher.dispatch(
      EVENT_NAMES.USER_DELETED,
      new UserDeletedEvent(user.id, user.email, user.name, user.tenantId ?? undefined, deletedAt),
    );

    return { id: userId };
  }
}

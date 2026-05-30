import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { EventDispatcherService } from 'src/core/events';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import { RoleProfileUpdatedEvent } from 'src/core/events/events/role-profile-updated.event';

import { UserPayload } from 'src/shared/interfaces';

import { RoleProfileUpdateDto } from './dto/role-profile-update.dto';

@Injectable()
export class RoleProfileUpdateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async update(roleProfileId: string, dto: RoleProfileUpdateDto, currentUser: UserPayload) {
    const roleProfile = await this.prisma.roleProfile.findFirst({
      where: { id: roleProfileId, deletedAt: null },
    });

    if (!roleProfile) {
      throw new NotFoundException('Perfil de função não encontrado');
    }

    const updated = await this.prisma.roleProfile.update({
      where: { id: roleProfileId },
      data: dto,
    });

    this.eventDispatcher.dispatch(
      EVENT_NAMES.ROLE_PROFILE_UPDATED,
      new RoleProfileUpdatedEvent(
        updated.id,
        updated.name,
        currentUser.id,
        currentUser.tenantId ?? undefined,
        dto,
      ),
    );

    return updated;
  }
}

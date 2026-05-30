import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { EventDispatcherService } from 'src/core/events';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import { RoleProfileCreatedEvent } from 'src/core/events/events/role-profile-created.event';

import { UserPayload } from 'src/shared/interfaces';

import { RoleProfileCreateDto } from './dto/role-profile-create.dto';

@Injectable()
export class RoleProfileCreateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async create(dto: RoleProfileCreateDto, currentUser: UserPayload) {
    const existing = await this.prisma.roleProfile.findFirst({
      where: { name: dto.name, tenantId: currentUser.tenantId ?? undefined, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('Já existe um perfil de função com este nome');
    }

    const roleProfile = await this.prisma.roleProfile.create({
      data: {
        name: dto.name,
        defaultPermissions: dto.defaultPermissions ?? [],
        description: dto.description,
        tenantId: currentUser.tenantId!,
      },
    });

    this.eventDispatcher.dispatch(
      EVENT_NAMES.ROLE_PROFILE_CREATED,
      new RoleProfileCreatedEvent(
        roleProfile.id,
        roleProfile.name,
        currentUser.id,
        currentUser.tenantId ?? undefined,
        { defaultPermissions: roleProfile.defaultPermissions },
      ),
    );

    return roleProfile;
  }
}

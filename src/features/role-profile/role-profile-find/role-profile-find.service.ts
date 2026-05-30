import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import type { UserPayload } from 'src/shared/interfaces';
import { tenantFilter } from 'src/shared/utils/tenant-filter';

@Injectable()
export class RoleProfileFindService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(roleProfileId: string, currentUser: UserPayload) {
    const roleProfile = await this.prisma.roleProfile.findFirst({
      where: { id: roleProfileId, deletedAt: null, ...tenantFilter(currentUser.tenantId) },
    });

    if (!roleProfile) {
      throw new NotFoundException('Perfil de função não encontrado');
    }

    return roleProfile;
  }
}

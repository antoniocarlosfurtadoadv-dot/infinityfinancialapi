import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';

import { RoleProfileListDto } from './dto/role-profile-list.dto';
import { findIdsByUnaccentName } from 'src/shared/utils/uitls';
import type { UserPayload } from 'src/shared/interfaces';
import { tenantFilter } from 'src/shared/utils/tenant-filter';

@Injectable()
export class RoleProfileListService {
  constructor(private readonly prisma: PrismaService) {}

  async list(currentUser: UserPayload, query: RoleProfileListDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null, ...tenantFilter(currentUser.tenantId) };

    if (query.name) {
      const ids = await findIdsByUnaccentName(this.prisma, 'role_profiles', query.name);
      where.id = { in: ids };
    }

    const [roleProfiles, total] = await this.prisma.$transaction([
      this.prisma.roleProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.roleProfile.count({ where }),
    ]);

    return {
      data: roleProfiles,
      total,
      currentPage: page,
      limit,
    };
  }
}

import { Injectable } from '@nestjs/common';

import type { UserPayload } from 'src/shared/interfaces';

import { UserListDto } from './dto/user-list.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { findIdsByUnaccentName } from 'src/shared/utils/uitls';
import { tenantFilter } from 'src/shared/utils/tenant-filter';

@Injectable()
export class UserListService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(currentUser: UserPayload, query: UserListDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...tenantFilter(currentUser.tenantId),
    };

    if (query.roleProfileId) {
      Object.assign(where, { roleProfileId: query.roleProfileId });
    }



    if (query.name) {
      const ids = await findIdsByUnaccentName(this.prismaService, 'users', query.name);
      Object.assign(where, { id: { in: ids } });
    }

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          tenantId: true,
          roleProfile: { select: { name: true } },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.user.count({ where }),
    ]);
    return {
      data: users,
      total,
      currentPage: page,
      limit,
    };
  }
}

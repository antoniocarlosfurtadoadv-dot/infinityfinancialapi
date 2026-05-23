import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AdminUsersListService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId: null, deletedAt: null },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          roleProfile: { select: { name: true } },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { tenantId: null, deletedAt: null } }),
    ]);

    return { data: users, total, currentPage: page, limit };
  }
}

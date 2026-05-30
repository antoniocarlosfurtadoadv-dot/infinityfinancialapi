import { Injectable } from '@nestjs/common';

import { LogListDto } from './dto/log-list.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import type { UserPayload } from 'src/shared/interfaces';
import { tenantFilter } from 'src/shared/utils/tenant-filter';

@Injectable()
export class LogListService {
  constructor(private readonly prisma: PrismaService) {}

  async list(currentUser: UserPayload, logListDto: LogListDto) {
    const page = Number(logListDto.page) || 1;
    const limit = Number(logListDto.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      ...tenantFilter(currentUser.tenantId),
    };

    if (logListDto.entity) {
      Object.assign(where, {
        entity: {
          contains: logListDto.entity,
          mode: 'insensitive',
        },
      });
    }

    const [data, total] = await Promise.all([
      this.prisma.log.findMany({
        where,
        select: {
          id: true,
          entity: true,
          userId: true,
          metadata: true,
          action: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.log.count({ where }),
    ]);

    return {
      data,
      total,
      currentPage: page,
      limit,
    };
  }
}

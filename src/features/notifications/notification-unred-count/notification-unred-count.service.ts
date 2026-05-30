import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';


@Injectable()
export class NotificationUnredCountService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUnreadCount(userId: string): Promise<number> {
    return await this.prismaService.notification.count({
      where: {
        userId,
        read: false,
        deletedAt: null,
      },
    });
  }
}

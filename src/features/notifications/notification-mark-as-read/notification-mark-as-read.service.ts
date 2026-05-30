import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';


@Injectable()
export class NotificationMarkAsReadService {
  constructor(private readonly prisma: PrismaService) {}

  async markAsRead(id: string, userId: string) {
    return await this.prisma.notification.updateMany({
      where: {
        id,
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }
}

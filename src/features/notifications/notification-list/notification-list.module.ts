import { Module } from '@nestjs/common';
import { NotificationListService } from './notification-list.service';
import { NotificationListController } from './notification-list.controller';

@Module({
  controllers: [NotificationListController],
  providers: [NotificationListService],
})
export class NotificationListModule {}

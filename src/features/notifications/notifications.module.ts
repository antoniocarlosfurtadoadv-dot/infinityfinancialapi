import { Module } from '@nestjs/common';

import { NotificationListModule } from './notification-list/notification-list.module';
import { NotificationMarkAsReadModule } from './notification-mark-as-read/notification-mark-as-read.module';
import { NotificationUnredCountModule } from './notification-unred-count/notification-unred-count.module';

@Module({
  imports: [
    NotificationListModule,
    NotificationMarkAsReadModule,
    NotificationUnredCountModule,
  ],
})
export class NotificationsModule {}

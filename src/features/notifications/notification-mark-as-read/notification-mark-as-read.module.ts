import { Module } from '@nestjs/common';

import { NotificationMarkAsReadController } from './notification-mark-as-read.controller';
import { NotificationMarkAsReadService } from './notification-mark-as-read.service';

@Module({
  controllers: [NotificationMarkAsReadController],
  providers: [NotificationMarkAsReadService],
})
export class NotificationMarkAsReadModule {}

import { Module } from '@nestjs/common';

import { NotificationUnredCountController } from './notification-unred-count.controller';
import { NotificationUnredCountService } from './notification-unred-count.service';

@Module({
  controllers: [NotificationUnredCountController],
  providers: [NotificationUnredCountService],
})
export class NotificationUnredCountModule {}

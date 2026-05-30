import { Module } from '@nestjs/common';
import { LogListService } from './log-list.service';
import { LogListController } from './log-list.controller';

@Module({
  controllers: [LogListController],
  providers: [LogListService],
})
export class LogListModule {}

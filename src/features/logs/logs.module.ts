import { Module } from '@nestjs/common';

import { LogListModule } from './log-list/log-list.module';

@Module({
  imports: [LogListModule],
})
export class LogsModule {}

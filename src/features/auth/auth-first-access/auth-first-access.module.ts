import { Module } from '@nestjs/common';

import { AuthFirstAccessController } from './auth-first-access.controller';
import { AuthFirstAccessService } from './auth-first-access.service';

@Module({
  controllers: [AuthFirstAccessController],
  providers: [AuthFirstAccessService],
})
export class AuthFirstAccessModule {}

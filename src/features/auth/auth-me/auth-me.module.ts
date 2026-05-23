import { Module } from '@nestjs/common';

import { AuthMeController } from './auth-me.controller';
import { AuthMeService } from './auth-me.service';

@Module({
  controllers: [AuthMeController],
  providers: [AuthMeService],
})
export class AuthMeModule {}

import { Module } from '@nestjs/common';

import { AuthVerifyCodeController } from './auth-verify-code.controller';
import { AuthVerifyCodeService } from './auth-verify-code.service';

@Module({
  controllers: [AuthVerifyCodeController],
  providers: [AuthVerifyCodeService],
})
export class AuthVerifyCodeModule {}

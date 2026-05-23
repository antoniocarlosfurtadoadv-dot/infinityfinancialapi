import { Module } from '@nestjs/common';

import { AuthChangePasswordController } from './auth-change-password.controller';
import { AuthChangePasswordService } from './auth-change-password.service';

@Module({
  controllers: [AuthChangePasswordController],
  providers: [AuthChangePasswordService],
})
export class AuthChangePasswordModule {}

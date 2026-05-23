import { Module } from '@nestjs/common';
import { UserResendFirstAccessLinkService } from './user-resend-first-access-link.service';
import { UserResendFirstAccessLinkController } from './user-resend-first-access-link.controller';

@Module({
  controllers: [UserResendFirstAccessLinkController],
  providers: [UserResendFirstAccessLinkService],
})
export class UserResendFirstAccessLinkModule {}

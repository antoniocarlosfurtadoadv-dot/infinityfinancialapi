import { Module } from '@nestjs/common';
import { RoleProfileUpdateService } from './role-profile-update.service';
import { RoleProfileUpdateController } from './role-profile-update.controller';

@Module({
  controllers: [RoleProfileUpdateController],
  providers: [RoleProfileUpdateService],
})
export class RoleProfileUpdateModule {}

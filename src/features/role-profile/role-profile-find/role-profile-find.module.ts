import { Module } from '@nestjs/common';
import { RoleProfileFindService } from './role-profile-find.service';
import { RoleProfileFindController } from './role-profile-find.controller';

@Module({
  controllers: [RoleProfileFindController],
  providers: [RoleProfileFindService],
})
export class RoleProfileFindModule {}

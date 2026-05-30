import { Module } from '@nestjs/common';
import { RoleProfileListService } from './role-profile-list.service';
import { RoleProfileListController } from './role-profile-list.controller';

@Module({
  controllers: [RoleProfileListController],
  providers: [RoleProfileListService],
})
export class RoleProfileListModule {}

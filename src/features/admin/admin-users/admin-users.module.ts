import { Module } from '@nestjs/common';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersCreateService } from './admin-users-create.service';
import { AdminUsersListService } from './admin-users-list.service';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersCreateService, AdminUsersListService],
})
export class AdminUsersModule {}

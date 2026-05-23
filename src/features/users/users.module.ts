import { Module } from '@nestjs/common';

import { UserCreateModule } from './user-create/user-create.module';
import { UserDeleteModule } from './user-delete/user-delete.module';
import { UserFindModule } from './user-find/user-find.module';
import { UserListModule } from './user-list/user-list.module';
import { UserUpdateModule } from './user-update/user-update.module';
import { UserUploadModule } from './user-upload/user-upload.module';
import { UserResendFirstAccessLinkModule } from './user-resend-first-access-link/user-resend-first-access-link.module';

@Module({
  imports: [
    UserDeleteModule,
    UserCreateModule,
    UserListModule,
    UserFindModule,
    UserUpdateModule,
    UserUploadModule,
    UserResendFirstAccessLinkModule,
  ],
})
export class UsersModule {}

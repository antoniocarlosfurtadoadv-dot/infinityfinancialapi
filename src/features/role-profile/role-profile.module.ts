import { Module } from '@nestjs/common';
import { RoleProfileCreateModule } from './role-profile-create/role-profile-create.module';
import { RoleProfileListModule } from './role-profile-list/role-profile-list.module';
import { RoleProfileFindModule } from './role-profile-find/role-profile-find.module';
import { RoleProfileUpdateModule } from './role-profile-update/role-profile-update.module';

@Module({

  imports: [RoleProfileCreateModule, RoleProfileListModule, RoleProfileFindModule, RoleProfileUpdateModule]
})
export class RoleProfileModule {}

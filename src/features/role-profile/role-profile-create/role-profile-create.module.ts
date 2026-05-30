import { Module } from '@nestjs/common';
import { RoleProfileCreateService } from './role-profile-create.service';
import { RoleProfileCreateController } from './role-profile-create.controller';

@Module({
  controllers: [RoleProfileCreateController],
  providers: [RoleProfileCreateService],
})
export class RoleProfileCreateModule {}

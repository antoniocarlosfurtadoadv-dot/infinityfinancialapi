import { Module } from '@nestjs/common';


import { UserUpdateController } from './user-update.controller';
import { UserUpdateService } from './user-update.service';

@Module({
  controllers: [UserUpdateController],
  providers: [UserUpdateService],
})
export class UserUpdateModule {}

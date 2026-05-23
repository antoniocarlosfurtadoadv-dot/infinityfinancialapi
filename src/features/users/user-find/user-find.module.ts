import { Module } from '@nestjs/common';


import { UserFindController } from './user-find.controller';
import { UserFindService } from './user-find.service';

@Module({
  controllers: [UserFindController],
  providers: [UserFindService],
})
export class UserFindModule {}

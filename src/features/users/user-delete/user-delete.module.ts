import { Module } from '@nestjs/common';



import { UserDeleteController } from './user-delete.controller';
import { UserDeleteService } from './user-delete.service';


@Module({
  controllers: [UserDeleteController],
  providers: [UserDeleteService],
})
export class UserDeleteModule {}

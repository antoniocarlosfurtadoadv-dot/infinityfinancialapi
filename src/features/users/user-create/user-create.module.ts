import { Module } from '@nestjs/common';
import { UserCreateService } from './user-create.service';
import { UserCreateController } from './user-create.controller';

@Module({
  controllers: [UserCreateController],
  providers: [UserCreateService],
})
export class UserCreateModule {}

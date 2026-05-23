import { Test, TestingModule } from '@nestjs/testing';

import { UserDeleteController } from './user-delete.controller';
import { UserDeleteService } from './user-delete.service';

describe('UserDeleteController', () => {
  let controller: UserDeleteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDeleteController],
      providers: [UserDeleteService],
    }).compile();

    controller = module.get<UserDeleteController>(UserDeleteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

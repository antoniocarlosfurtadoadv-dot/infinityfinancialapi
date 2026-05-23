import { Test, TestingModule } from '@nestjs/testing';

import { UserUpdateController } from './user-update.controller';
import { UserUpdateService } from './user-update.service';

describe('UserUpdateController', () => {
  let controller: UserUpdateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserUpdateController],
      providers: [UserUpdateService],
    }).compile();

    controller = module.get<UserUpdateController>(UserUpdateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

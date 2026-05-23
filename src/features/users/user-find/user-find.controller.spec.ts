import { Test, TestingModule } from '@nestjs/testing';

import { UserFindController } from './user-find.controller';
import { UserFindService } from './user-find.service';

describe('UserFindController', () => {
  let controller: UserFindController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFindController],
      providers: [UserFindService],
    }).compile();

    controller = module.get<UserFindController>(UserFindController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

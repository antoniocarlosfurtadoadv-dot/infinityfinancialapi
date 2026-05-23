import { Test, TestingModule } from '@nestjs/testing';
import { UserCreateController } from './user-create.controller';
import { UserCreateService } from './user-create.service';

describe('UserCreateController', () => {
  let controller: UserCreateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserCreateController],
      providers: [UserCreateService],
    }).compile();

    controller = module.get<UserCreateController>(UserCreateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

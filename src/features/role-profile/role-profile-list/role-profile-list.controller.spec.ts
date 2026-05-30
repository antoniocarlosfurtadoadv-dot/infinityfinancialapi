import { Test, TestingModule } from '@nestjs/testing';
import { RoleProfileListController } from './role-profile-list.controller';
import { RoleProfileListService } from './role-profile-list.service';

describe('RoleProfileListController', () => {
  let controller: RoleProfileListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleProfileListController],
      providers: [RoleProfileListService],
    }).compile();

    controller = module.get<RoleProfileListController>(RoleProfileListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

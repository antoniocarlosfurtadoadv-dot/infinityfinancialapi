import { Test, TestingModule } from '@nestjs/testing';
import { RoleProfileFindController } from './role-profile-find.controller';
import { RoleProfileFindService } from './role-profile-find.service';

describe('RoleProfileFindController', () => {
  let controller: RoleProfileFindController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleProfileFindController],
      providers: [RoleProfileFindService],
    }).compile();

    controller = module.get<RoleProfileFindController>(RoleProfileFindController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

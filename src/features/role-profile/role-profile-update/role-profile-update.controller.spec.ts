import { Test, TestingModule } from '@nestjs/testing';
import { RoleProfileUpdateController } from './role-profile-update.controller';
import { RoleProfileUpdateService } from './role-profile-update.service';

describe('RoleProfileUpdateController', () => {
  let controller: RoleProfileUpdateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleProfileUpdateController],
      providers: [RoleProfileUpdateService],
    }).compile();

    controller = module.get<RoleProfileUpdateController>(RoleProfileUpdateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

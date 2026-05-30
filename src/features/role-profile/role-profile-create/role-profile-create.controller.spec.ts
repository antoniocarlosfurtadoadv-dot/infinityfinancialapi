import { Test, TestingModule } from '@nestjs/testing';
import { RoleProfileCreateController } from './role-profile-create.controller';
import { RoleProfileCreateService } from './role-profile-create.service';

describe('RoleProfileCreateController', () => {
  let controller: RoleProfileCreateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleProfileCreateController],
      providers: [RoleProfileCreateService],
    }).compile();

    controller = module.get<RoleProfileCreateController>(RoleProfileCreateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RoleProfileCreateService } from './role-profile-create.service';

describe('RoleProfileCreateService', () => {
  let service: RoleProfileCreateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleProfileCreateService],
    }).compile();

    service = module.get<RoleProfileCreateService>(RoleProfileCreateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

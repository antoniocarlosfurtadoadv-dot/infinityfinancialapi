import { Test, TestingModule } from '@nestjs/testing';
import { RoleProfileUpdateService } from './role-profile-update.service';

describe('RoleProfileUpdateService', () => {
  let service: RoleProfileUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleProfileUpdateService],
    }).compile();

    service = module.get<RoleProfileUpdateService>(RoleProfileUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

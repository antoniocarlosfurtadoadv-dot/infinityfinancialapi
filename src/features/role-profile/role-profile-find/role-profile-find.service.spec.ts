import { Test, TestingModule } from '@nestjs/testing';
import { RoleProfileFindService } from './role-profile-find.service';

describe('RoleProfileFindService', () => {
  let service: RoleProfileFindService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleProfileFindService],
    }).compile();

    service = module.get<RoleProfileFindService>(RoleProfileFindService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

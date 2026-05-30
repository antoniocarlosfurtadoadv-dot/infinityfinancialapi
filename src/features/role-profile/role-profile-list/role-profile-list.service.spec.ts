import { Test, TestingModule } from '@nestjs/testing';
import { RoleProfileListService } from './role-profile-list.service';

describe('RoleProfileListService', () => {
  let service: RoleProfileListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleProfileListService],
    }).compile();

    service = module.get<RoleProfileListService>(RoleProfileListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

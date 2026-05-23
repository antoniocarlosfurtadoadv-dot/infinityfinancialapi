import { Test, TestingModule } from '@nestjs/testing';
import { AuthRefreshService } from './auth-refresh.service';

describe('AuthRefreshService', () => {
  let service: AuthRefreshService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRefreshService],
    }).compile();

    service = module.get<AuthRefreshService>(AuthRefreshService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthChangePasswordService } from './auth-change-password.service';

describe('AuthChangePasswordService', () => {
  let service: AuthChangePasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthChangePasswordService],
    }).compile();

    service = module.get<AuthChangePasswordService>(AuthChangePasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthVerifyCodeService } from './auth-verify-code.service';

describe('AuthVerifyCodeService', () => {
  let service: AuthVerifyCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthVerifyCodeService],
    }).compile();

    service = module.get<AuthVerifyCodeService>(AuthVerifyCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

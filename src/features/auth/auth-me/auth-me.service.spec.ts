import { Test, TestingModule } from '@nestjs/testing';
import { AuthMeService } from './auth-me.service';

describe('AuthMeService', () => {
  let service: AuthMeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthMeService],
    }).compile();

    service = module.get<AuthMeService>(AuthMeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

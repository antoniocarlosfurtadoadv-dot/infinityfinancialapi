import { Test, TestingModule } from '@nestjs/testing';
import { UserResendFirstAccessLinkService } from './user-resend-first-access-link.service';

describe('UserResendFirstAccessLinkService', () => {
  let service: UserResendFirstAccessLinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResendFirstAccessLinkService],
    }).compile();

    service = module.get<UserResendFirstAccessLinkService>(UserResendFirstAccessLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserResendFirstAccessLinkController } from './user-resend-first-access-link.controller';
import { UserResendFirstAccessLinkService } from './user-resend-first-access-link.service';

describe('UserResendFirstAccessLinkController', () => {
  let controller: UserResendFirstAccessLinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserResendFirstAccessLinkController],
      providers: [UserResendFirstAccessLinkService],
    }).compile();

    controller = module.get<UserResendFirstAccessLinkController>(UserResendFirstAccessLinkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthVerifyCodeController } from './auth-verify-code.controller';
import { AuthVerifyCodeService } from './auth-verify-code.service';

describe('AuthVerifyCodeController', () => {
  let controller: AuthVerifyCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthVerifyCodeController],
      providers: [AuthVerifyCodeService],
    }).compile();

    controller = module.get<AuthVerifyCodeController>(AuthVerifyCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

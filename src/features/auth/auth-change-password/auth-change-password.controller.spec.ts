import { Test, TestingModule } from '@nestjs/testing';
import { AuthChangePasswordController } from './auth-change-password.controller';
import { AuthChangePasswordService } from './auth-change-password.service';

describe('AuthChangePasswordController', () => {
  let controller: AuthChangePasswordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthChangePasswordController],
      providers: [AuthChangePasswordService],
    }).compile();

    controller = module.get<AuthChangePasswordController>(AuthChangePasswordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

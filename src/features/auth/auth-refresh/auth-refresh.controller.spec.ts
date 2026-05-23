import { Test, TestingModule } from '@nestjs/testing';
import { AuthRefreshController } from './auth-refresh.controller';
import { AuthRefreshService } from './auth-refresh.service';

describe('AuthRefreshController', () => {
  let controller: AuthRefreshController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthRefreshController],
      providers: [AuthRefreshService],
    }).compile();

    controller = module.get<AuthRefreshController>(AuthRefreshController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

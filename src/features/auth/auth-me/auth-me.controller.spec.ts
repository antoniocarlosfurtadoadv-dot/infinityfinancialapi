import { Test, TestingModule } from '@nestjs/testing';
import { AuthMeController } from './auth-me.controller';
import { AuthMeService } from './auth-me.service';

describe('AuthMeController', () => {
  let controller: AuthMeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthMeController],
      providers: [AuthMeService],
    }).compile();

    controller = module.get<AuthMeController>(AuthMeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

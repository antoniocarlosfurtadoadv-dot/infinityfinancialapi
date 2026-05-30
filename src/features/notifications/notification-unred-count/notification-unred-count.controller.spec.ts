import { Test, TestingModule } from '@nestjs/testing';
import { NotificationUnredCountController } from './notification-unred-count.controller';
import { NotificationUnredCountService } from './notification-unred-count.service';

describe('NotificationUnredCountController', () => {
  let controller: NotificationUnredCountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationUnredCountController],
      providers: [NotificationUnredCountService],
    }).compile();

    controller = module.get<NotificationUnredCountController>(NotificationUnredCountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

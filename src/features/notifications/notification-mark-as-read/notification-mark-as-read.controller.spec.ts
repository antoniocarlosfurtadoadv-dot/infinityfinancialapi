import { Test, TestingModule } from '@nestjs/testing';
import { NotificationMarkAsReadController } from './notification-mark-as-read.controller';
import { NotificationMarkAsReadService } from './notification-mark-as-read.service';

describe('NotificationMarkAsReadController', () => {
  let controller: NotificationMarkAsReadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationMarkAsReadController],
      providers: [NotificationMarkAsReadService],
    }).compile();

    controller = module.get<NotificationMarkAsReadController>(NotificationMarkAsReadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

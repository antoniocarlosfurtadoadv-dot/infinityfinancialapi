import { Test, TestingModule } from '@nestjs/testing';
import { NotificationListController } from './notification-list.controller';
import { NotificationListService } from './notification-list.service';

describe('NotificationListController', () => {
  let controller: NotificationListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationListController],
      providers: [NotificationListService],
    }).compile();

    controller = module.get<NotificationListController>(NotificationListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

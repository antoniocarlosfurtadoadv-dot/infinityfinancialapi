import { Test, TestingModule } from '@nestjs/testing';
import { NotificationListService } from './notification-list.service';

describe('NotificationListService', () => {
  let service: NotificationListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationListService],
    }).compile();

    service = module.get<NotificationListService>(NotificationListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

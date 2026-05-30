import { Test, TestingModule } from '@nestjs/testing';
import { NotificationUnredCountService } from './notification-unred-count.service';

describe('NotificationUnredCountService', () => {
  let service: NotificationUnredCountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationUnredCountService],
    }).compile();

    service = module.get<NotificationUnredCountService>(NotificationUnredCountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

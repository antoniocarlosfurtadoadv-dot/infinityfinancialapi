import { Test, TestingModule } from '@nestjs/testing';
import { NotificationMarkAsReadService } from './notification-mark-as-read.service';

describe('NotificationMarkAsReadService', () => {
  let service: NotificationMarkAsReadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationMarkAsReadService],
    }).compile();

    service = module.get<NotificationMarkAsReadService>(NotificationMarkAsReadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { LogListService } from './log-list.service';

describe('LogListService', () => {
  let service: LogListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogListService],
    }).compile();

    service = module.get<LogListService>(LogListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

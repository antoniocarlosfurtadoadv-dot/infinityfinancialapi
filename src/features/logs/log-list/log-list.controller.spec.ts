import { Test, TestingModule } from '@nestjs/testing';
import { LogListController } from './log-list.controller';
import { LogListService } from './log-list.service';

describe('LogListController', () => {
  let controller: LogListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogListController],
      providers: [LogListService],
    }).compile();

    controller = module.get<LogListController>(LogListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

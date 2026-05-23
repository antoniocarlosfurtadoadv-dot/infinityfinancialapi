import { Test, TestingModule } from '@nestjs/testing';

import { UserFindService } from './user-find.service';

describe('UserFindService', () => {
  let service: UserFindService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserFindService],
    }).compile();

    service = module.get<UserFindService>(UserFindService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

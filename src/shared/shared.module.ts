import { Global, Module } from '@nestjs/common';

import { ApiResponseService } from './services';

@Global()
@Module({
  providers: [ApiResponseService],
  exports: [ApiResponseService],
})
export class SharedModule {}

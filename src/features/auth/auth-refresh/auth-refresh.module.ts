import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth.module';
import { AuthRefreshController } from './auth-refresh.controller';
import { AuthRefreshService } from './auth-refresh.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [AuthRefreshController],
  providers: [AuthRefreshService],
})
export class AuthRefreshModule {}

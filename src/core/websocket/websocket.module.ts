import { forwardRef, Module } from '@nestjs/common';


import { NotificationsGateway } from './gateways/notifications.gateway';
import { ScanGateway } from './gateways/scan.gateway';
import { ScanSessionStoreService } from './services/scan-session-store.service';
import { AuthModule } from 'src/features/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [NotificationsGateway, ScanGateway, ScanSessionStoreService],
  exports: [NotificationsGateway, ScanSessionStoreService],
})
export class WebsocketModule {}

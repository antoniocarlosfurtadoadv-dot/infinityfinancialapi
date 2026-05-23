import { Module } from '@nestjs/common';

import { EmailModule } from './email/email.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [EmailModule, StorageModule],
})
export class IntegrationsModule {}

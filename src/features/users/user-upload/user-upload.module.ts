import { Module } from '@nestjs/common';

import { StorageModule } from 'src/core/integrations/storage/storage.module';

import { UserUploadController } from './user-upload.controller';
import { UserUploadService } from './user-upload.service';

@Module({
  imports: [StorageModule],
  controllers: [UserUploadController],
  providers: [UserUploadService],
})
export class UserUploadModule {}

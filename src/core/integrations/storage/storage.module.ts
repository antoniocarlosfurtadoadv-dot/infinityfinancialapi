import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CloudflareR2Adapter } from './adapters/cloudflare-r2.adapter';
import { MinioAdapter } from './adapters/minio.adapter';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [
    CloudflareR2Adapter,
    MinioAdapter,
    {
      provide: 'STORAGE_ADAPTER',
      useFactory: (configService: ConfigService) => {
        const storageProvider =
          configService.get<string>('STORAGE_PROVIDER') || 'cloudflare-r2';

        if (storageProvider === 'minio') {
          return new MinioAdapter(configService);
        }
        // Default to Cloudflare R2
        return new CloudflareR2Adapter(configService);
      },
      inject: [ConfigService],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}

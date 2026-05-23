import { BullModule } from '@nestjs/bull';
import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailModule } from '../integrations/email/email.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { QUEUE_NAMES } from './constants/queue-names.constant';
import { EmailProcessor } from './processors/email.processor';
import { LogProcessor } from './processors/log.processor';

import { QueueService } from './services/queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisConfig = {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        };

        const logger = new Logger('BullModule');
        logger.log(`Configuring Redis connection: ${redisConfig.host}:${redisConfig.port}`);

        return {
          redis: {
            ...redisConfig,
            retryStrategy: (times: number) => {
              const maxRetries = 3;
              if (times > maxRetries) {
                logger.error(`Redis connection failed after ${maxRetries} attempts`);
                return null; // Stop retrying
              }
              logger.warn(`Redis connection attempt ${times}/${maxRetries} failed. Retrying...`);
              return Math.min(times * 1000, 3000);
            },
          },
          defaultJobOptions: {
            removeOnComplete: 100, // Keep last 100 completed jobs
            removeOnFail: 1000, // Keep last 1000 failed jobs
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.NOTIFICATION },
      { name: QUEUE_NAMES.TASK },
      { name: QUEUE_NAMES.LOG },
      { name: QUEUE_NAMES.FILE },
      { name: QUEUE_NAMES.AI },
    ),
    EmailModule,
    WebsocketModule,
  ],
  providers: [
    QueueService,
    EmailProcessor,
    LogProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}

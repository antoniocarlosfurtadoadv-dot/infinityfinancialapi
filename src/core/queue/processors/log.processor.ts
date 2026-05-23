import * as Bull from 'bull';

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';


import { QUEUE_NAMES } from '../constants/queue-names.constant';
import * as JobInterfaces from '../interfaces/job.interface';
import { PrismaService } from 'src/core/database/prisma.service';

@Processor(QUEUE_NAMES.LOG)
export class LogProcessor {
  private readonly logger = new Logger(LogProcessor.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Process()
  async handleLogJob(job: Bull.Job<JobInterfaces.CreateLogJob>) {
    this.logger.log(`Processing log job ${job.id}`);
    const { action, entity, entityId, userId, tenantId, metadata } = job.data;

    try {
      // Criar log no banco de dados
      await this.prismaService.log.create({
        data: {
          action: action,
          entity: entity,
          entityId: entityId,
          userId: userId,
          metadata: metadata || {},
          tenantId: tenantId,
        },
      });

      this.logger.log(
        `Log created: ${action} on ${entity} (${entityId}) by user ${userId}`,
      );

      return { success: true, action, entity };
    } catch (error) {
      this.logger.error(`Failed to create log for ${entity}:`, error);
      throw error;
    }
  }
}

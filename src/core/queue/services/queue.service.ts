import * as Bull from 'bull';

import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';

import { QUEUE_NAMES } from '../constants/queue-names.constant';
import * as JobInterfaces from '../interfaces/job.interface';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL) private emailQueue: Bull.Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATION)
    private notificationQueue: Bull.Queue,
    @InjectQueue(QUEUE_NAMES.TASK) private taskQueue: Bull.Queue,
    @InjectQueue(QUEUE_NAMES.LOG) private logQueue: Bull.Queue,
    @InjectQueue(QUEUE_NAMES.FILE) private fileQueue: Bull.Queue,
    @InjectQueue(QUEUE_NAMES.AI) private aiQueue: Bull.Queue,
  ) {}

  /**
   * Adiciona um job de e-mail à fila
   */
  async addEmailJob(data: JobInterfaces.SendEmailJob, priority = 5) {
    this.logger.log(`Adding email job to queue: ${data.to}`);
    try {
      const job = await this.emailQueue.add(data, {
        priority,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
      this.logger.log(`Email job added successfully with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add email job: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Adiciona um job de notificação à fila
   */
  async addNotificationJob(
    data: JobInterfaces.SendNotificationJob,
    priority = 5,
  ) {
    this.logger.log(`Adding notification job to queue: ${data.userId}`);
    return this.notificationQueue.add(data, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  /**
   * Adiciona um job de processamento de tarefa à fila
   */
  async addTaskJob(data: JobInterfaces.TaskProcessJob, priority = 5) {
    this.logger.log(`Adding task job to queue: ${data.taskId}`);
    return this.taskQueue.add(data, {
      priority,
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 3000,
      },
    });
  }

  /**
   * Adiciona um job de log à fila
   */
  async addLogJob(data: JobInterfaces.CreateLogJob, priority = 10) {
    this.logger.log(
      `Adding log job to queue: ${data.action} on ${data.entity}`,
    );
    return this.logQueue.add(data, {
      priority,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  /**
   * Adiciona um job de arquivo à fila
   */
  async addFileJob(data: JobInterfaces.FileProcessJob, priority = 5) {
    this.logger.log(
      `Adding file job to queue: ${data.action} for file ${data.fileId}`,
    );
    return this.fileQueue.add(data, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  /**
   * Adiciona um job de IA à fila
   */
  async addAIJob(data: JobInterfaces.AIJob, priority = 5) {
    this.logger.log(`Adding AI job to queue: type=${data.type}`);
    try {
      const job = await this.aiQueue.add(data, {
        priority,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      });
      this.logger.log(`AI job added successfully with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add AI job: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de uma fila específica
   */
  async getQueueStats(queueName: string) {
    let queue: Bull.Queue;

    switch (queueName) {
      case QUEUE_NAMES.EMAIL:
        queue = this.emailQueue;
        break;
      case QUEUE_NAMES.NOTIFICATION:
        queue = this.notificationQueue;
        break;
      case QUEUE_NAMES.TASK:
        queue = this.taskQueue;
        break;
      case QUEUE_NAMES.LOG:
        queue = this.logQueue;
        break;
      case QUEUE_NAMES.FILE:
        queue = this.fileQueue;
        break;
      case QUEUE_NAMES.AI:
        queue = this.aiQueue;
        break;
      default:
        throw new Error(`Fila desconhecida: ${queueName}`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }
}

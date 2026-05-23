export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  NOTIFICATION: 'notification-queue',
  TASK: 'task-queue',
  LOG: 'log-queue',
  FILE: 'file-queue',
  AI: 'ai-queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

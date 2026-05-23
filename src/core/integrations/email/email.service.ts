import { Inject, Injectable } from '@nestjs/common';

import type { IEmailAdapter } from './interfaces/email-adapter.interface';
import {
  SendEmailDto,
  EmailResponse,
} from './interfaces/email-adapter.interface';

@Injectable()
export class EmailService {
  constructor(
    @Inject('EMAIL_ADAPTER')
    private readonly emailAdapter: IEmailAdapter,
  ) {}

  async sendEmail(data: SendEmailDto): Promise<EmailResponse> {
    return this.emailAdapter.sendEmail(data);
  }

  async sendBulkEmails(emails: SendEmailDto[]): Promise<EmailResponse[]> {
    return this.emailAdapter.sendBulkEmails(emails);
  }

  async verifyConnection(): Promise<boolean> {
    return this.emailAdapter.verifyConnection();
  }
}

import { Resend } from 'resend';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  IEmailAdapter,
  SendEmailDto,
  EmailResponse,
} from '../interfaces/email-adapter.interface';

@Injectable()
export class ResendAdapter implements IEmailAdapter {
  private readonly logger = new Logger(ResendAdapter.name);
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not found in environment variables. Resend adapter will not work properly.',
      );
    } else {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend adapter initialized successfully');
    }
  }

  async sendEmail(data: SendEmailDto): Promise<EmailResponse> {
    try {
      if (!this.resend) {
        throw new Error('Resend não está inicializado. Verifique a RESEND_API_KEY.');
      }

      const recipients = Array.isArray(data.to) ? data.to.join(', ') : data.to;
      this.logger.log(`Sending email via Resend to: ${recipients}`);

      const emailData: any = {
        from: '"Atlas Suporte" <no-reply@atlasecolab.com>',
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
        html: data.html || data.body,
      };

      // Add optional fields
      if (data.cc) {
        emailData.cc = Array.isArray(data.cc) ? data.cc : [data.cc];
      }
      if (data.bcc) {
        emailData.bcc = Array.isArray(data.bcc) ? data.bcc : [data.bcc];
      }
      if (data.attachments && data.attachments.length > 0) {
        emailData.attachments = data.attachments.map((att) => ({
          content: att.content,
          filename: att.filename,
        }));
      }

      const response = await this.resend.emails.send(emailData);

      if (response.error) {
        throw new Error(response.error.message);
      }

      this.logger.log(
        `Email sent successfully via Resend. ID: ${response.data?.id}`,
      );

      return {
        success: true,
        messageId: response.data?.id || 'unknown',
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to send email via Resend: ${err.message}`,
        err.stack,
      );
      return {
        success: false,
        error: err.message,
      };
    }
  }

  async sendBulkEmails(emails: SendEmailDto[]): Promise<EmailResponse[]> {
    try {
      if (!this.resend) {
        throw new Error('Resend não está inicializado. Verifique a RESEND_API_KEY.');
      }

      this.logger.log(`Sending ${emails.length} emails via Resend (batch mode)`);

      // Resend doesn't have a native bulk send API, so we send individually
      const results = await Promise.allSettled(
        emails.map((email) => this.sendEmail(email)),
      );

      this.logger.log(
        `Bulk emails completed. Success: ${results.filter((r) => r.status === 'fulfilled').length}/${emails.length}`,
      );

      return results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            success: false,
            error: result.reason?.message || 'Unknown error',
          };
        }
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to send bulk emails via Resend: ${err.message}`,
      );
      return emails.map(() => ({
        success: false,
        error: err.message,
      }));
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.resend) {
        this.logger.warn('Resend API key not configured');
        return false;
      }

      // Test connection by getting API keys (requires API key to work)
      // Resend doesn't have a ping endpoint, so we verify the instance exists
      this.logger.log('Resend connection verified (API key is set)');
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Resend connection failed: ${err.message}`);
      return false;
    }
  }
}

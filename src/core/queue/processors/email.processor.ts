import type { Job } from 'bull';

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

import {
  EmailTemplateService,
  type EmailTemplateName,
} from '../../integrations/email/email-template.service';
import { EmailService } from '../../integrations/email/email.service';
import { QUEUE_NAMES } from '../constants/queue-names.constant';
import * as JobInterfaces from '../interfaces/job.interface';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  @Process()
  async handleEmailJob(job: Job<JobInterfaces.SendEmailJob>) {
    this.logger.log(`Processing email job ${job.id}`);
    const { to, subject, template, context } = job.data;

    try {
      let emailSubject = subject;
      let emailBody = '';
      let emailHtml = '';

      // Get template if specified
      if (template) {
        try {
          // Render template using EmailTemplateService
          emailHtml = this.emailTemplateService.render(
            template as EmailTemplateName,
            context,
          );
          emailSubject = this.emailTemplateService.getSubject(
            template as EmailTemplateName,
            context,
          );
          emailBody = `This email requires HTML support. Please enable HTML in your email client.`;
        } catch (error) {
          this.logger.warn(
            `Template "${template}" rendering failed: ${error.message}. Using default content.`,
          );
          emailBody = `Template: ${template}\nContext: ${JSON.stringify(context, null, 2)}`;
        }
      } else {
        // Use context to build simple email if no template
        emailBody = JSON.stringify(context, null, 2);
      }

      // Send email using EmailService
      const result = await this.emailService.sendEmail({
        to,
        subject: emailSubject,
        body: emailBody,
        html: emailHtml || undefined,
      });

      if (result.success) {
        this.logger.log(
          `Email sent successfully to ${to} with subject: ${emailSubject}`,
        );
      } else {
        this.logger.error(`Failed to send email to ${to}: ${result.error}`);
        throw new Error(result.error || 'Falha ao enviar e-mail');
      }

      return {
        success: true,
        to,
        subject: emailSubject,
        messageId: result.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}

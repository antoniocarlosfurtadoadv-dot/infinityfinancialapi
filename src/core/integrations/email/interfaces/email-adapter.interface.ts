export interface SendEmailDto {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailAdapter {
  sendEmail(data: SendEmailDto): Promise<EmailResponse>;
  sendBulkEmails(emails: SendEmailDto[]): Promise<EmailResponse[]>;
  verifyConnection(): Promise<boolean>;
}

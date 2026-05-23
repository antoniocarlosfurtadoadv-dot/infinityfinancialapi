import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailTemplateService } from './email-template.service';
import { EmailService } from './email.service';
import { ResendAdapter } from './adapters/resend.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'EMAIL_ADAPTER',
      useFactory: (configService: ConfigService) => {
        const emailProvider =
          configService.get<string>('EMAIL_PROVIDER') || 'resend';

        // Return the appropriate adapter based on configuration
        if (emailProvider === 'resend') {
          return new ResendAdapter(configService);
        }
      },
      inject: [ConfigService],
    },
    EmailService,
    EmailTemplateService,
  ],
  exports: [EmailService, EmailTemplateService],
})
export class EmailModule {}

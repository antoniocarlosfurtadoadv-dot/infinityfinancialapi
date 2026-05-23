import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type EmailTemplateName =
  | 'verification-code'
  | 'user-welcome'
  | 'password-reset'
  | 'password-changed'
  | 'account-deleted'
  | 'new-device-access';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  private readonly templatesPath = path.join(__dirname, 'templates');
  private readonly templates = new Map<string, HandlebarsTemplateDelegate>();

  constructor(private readonly configService: ConfigService) {
    this.registerHelpers();
    this.preloadTemplates();
  }

  private registerHelpers(): void {
    // Helper to convert string to lowercase
    Handlebars.registerHelper('toLowerCase', (str: string) => {
      return str ? str.toLowerCase() : '';
    });

    // Helper to replace underscores with spaces
    Handlebars.registerHelper('replaceUnderscore', (str: string) => {
      return str ? str.replace(/_/g, ' ') : '';
    });

    // Helper to split a code string into individual characters for each-block rendering
    Handlebars.registerHelper('splitChars', (value: string) => {
      if (!value) {
        return [];
      }

      return value.split('');
    });
  }

  private preloadTemplates(): void {
    const templateNames: EmailTemplateName[] = [
      'verification-code',
      'user-welcome',
      'password-reset',
      'password-changed',
      'account-deleted',
      'new-device-access',
    ];

    for (const name of templateNames) {
      try {
        const templatePath = path.join(this.templatesPath, `${name}.hbs`);
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const compiled = Handlebars.compile(templateContent);
        this.templates.set(name, compiled);
        this.logger.log(`Template "${name}" preloaded successfully`);
      } catch (error) {
        this.logger.error(`Failed to preload template "${name}":`, error);
      }
    }
  }

  public render(
    templateName: EmailTemplateName,
    context: Record<string, any>,
  ): string {
    this.logger.log(
      `Rendering template "${templateName}" with context: ${JSON.stringify(context)}`,
    );

    const template = this.templates.get(templateName);

    if (!template) {
      throw new Error(`Template "${templateName}" não encontrado`);
    }

    // Add common context variables
    const enrichedContext = {
      ...context,
      year: new Date().getFullYear(),
      appUrl: this.configService.get<string>(
        'APP_URL',
        'http://localhost:3000',
      ),
    };

    return template(enrichedContext);
  }

  public getSubject(
    templateName: EmailTemplateName,
    context: Record<string, any>,
  ): string {
    const subjects: Record<EmailTemplateName, string> = {
      'verification-code': 'Seu código de verificação de login',
      'user-welcome': 'Bem-vindo ao Atlas Ecolab!',
      'password-reset': 'Requisição de redefinição de senha',
      'password-changed': 'Sua senha foi atualizada com sucesso',
      'account-deleted': 'Sua conta foi excluída',
      'new-device-access': 'Novo acesso detectado na sua conta',
    };

    return subjects[templateName] || 'Notificação do Atlas Ecolab';
  }
}

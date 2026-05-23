# Email Templates Guide

This folder contains the Handlebars templates used by the email integration.
Templates are preloaded by [email-template.service.ts](../email-template.service.ts) at startup and rendered through the shared email service.

## Available Templates

| Template            | Subject                                | Purpose                              |
| ------------------- | -------------------------------------- | ------------------------------------ |
| `verification-code` | `Seu código de verificação de login`   | Login verification code email        |
| `password-reset`    | `Requisição de redefinição de senha`   | Password reset flow                  |
| `user-welcome`      | `Bem-vindo ao Atlas Ecolab!`           | New user onboarding email            |
| `password-changed`  | `Sua senha foi atualizada com sucesso` | Password change notification         |
| `account-deleted`   | `Sua conta foi excluída`               | Account deletion notice              |
| `new-device-access` | `Novo acesso detectado na sua conta`   | Suspicious or new device login alert |

## Shared Context

Every template rendered by the service receives these common values automatically:

```ts
export type EmailTemplateName =
  | 'verification-code'
  | 'password-reset'
  | 'user-welcome'
  | 'password-changed'
  | 'account-deleted'
  | 'new-device-access'
  | 'my-template'; // ← add here
```

### Available templates

| Template | Description | Key variables |
|----------|-------------|---------------|
| `verification-code` | MFA / login verification code | `userName`, `code` |
| `password-reset` | Forgot-password reset code | `name`, `code`, `codeArray` |
| `user-welcome` | New user welcome / first-access | `userName`, `userEmail`, `password`, `loginUrl`, `companyName`, `logoUrl` |
| `password-changed` | Password successfully changed | `userName`, `deviceInfo`, `accessTime`, `ipAddress`, `securityUrl` |
| `account-deleted` | Account permanently deleted | `userName` |
| `new-device-access` | New device / unrecognised sign-in | `userName`, `deviceInfo`, `accessTime`, `ipAddress`, `securityUrl` |

### 3. Follow the color palette

The service registers the following Handlebars helpers before loading the templates:

- `toLowerCase(value)`
- `replaceUnderscore(value)`
- `splitChars(value)`

Use them when a template needs to format profile labels, split one-time codes, or normalize text for display.

## Template Structure

The existing templates follow a small set of patterns rather than a single shared layout. Keep new templates consistent with the current style:

- Use Portuguese copy and `pt-BR` as the document language.
- Keep the Atlas Ecolab brand colors already in use: `#023DFF`, `#071c5f`, `#f6f6fa`, `#ededed`, and related neutrals.
- Prefer table-based markup for templates that need broader email client support.
- Include a visible footer with the copyright line using `{{year}}`.

If you are adding a new template, inspect the closest existing template first and match its structure.

## Adding A New Template

1. Create a new `.hbs` file in this folder.
2. Add the new template name to `EmailTemplateName` in [templates/index.ts](index.ts) and [email-template.service.ts](../email-template.service.ts).
3. Add the template name to the preload list in [email-template.service.ts](../email-template.service.ts).
4. Add the subject mapping in [email-template.service.ts](../email-template.service.ts).
5. Make sure the template uses only context values that are actually provided by the caller or injected by the service.

## Quick Checklist

- [ ] `.hbs` file created in this folder
- [ ] Template name added to `EmailTemplateName` in `index.ts`
- [ ] Uses the standard color palette (`#023DFF`, `#FFFFFF`, `#F5F7FE`)
- [ ] Follows the base HTML structure (header → content → footer)
- [ ] Includes `{{year}}` in the footer copyright
- [ ] Does **not** load external fonts or stylesheets (inline all styles for email-client compatibility)
- [ ] CTA buttons use `{{#if url}}` guard to avoid broken links when the variable is absent

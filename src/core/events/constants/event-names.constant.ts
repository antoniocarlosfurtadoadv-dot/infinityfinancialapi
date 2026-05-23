export const EVENT_NAMES = {
  // User
  USER_CREATED: 'user.created',
  USER_DELETED: 'user.deleted',
  USER_UPDATED: 'user.updated',

  // Role Profile
  ROLE_PROFILE_CREATED: 'role-profile.created',
  ROLE_PROFILE_UPDATED: 'role-profile.updated',

  // Auth
  VERIFICATION_CODE_EMAIL: 'auth.verification.code.email',
  PASSWORD_RESET: 'auth.password.reset',
  PASSWORD_CHANGED: 'auth.password.changed',
  FIRST_ACCESS_RESEND: 'auth.first-access.resend',
  NEW_DEVICE_ACCESS: 'auth.new-device.access',

  // Storage
  FILE_UPLOAD: 'file.upload',
  FILE_DELETE: 'file.delete',

  // Billing & Subscriptions
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_PLAN_CHANGED: 'subscription.plan.changed',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  TRIAL_ENDING_SOON: 'subscription.trial.ending-soon',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

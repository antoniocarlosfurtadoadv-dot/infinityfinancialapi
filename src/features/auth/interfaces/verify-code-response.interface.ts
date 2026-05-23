export interface VerifyCodeResponse {
  requiresPasswordChange: boolean;
  pendingUserId?: string;
  access_token?: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    mustChangePassword: boolean;
  };
}

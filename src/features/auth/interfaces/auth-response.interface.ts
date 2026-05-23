export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    roleProfile: {
      name: string;
      defaultPermissions: string[];
    };
    mustChangePassword: boolean;
  };
}

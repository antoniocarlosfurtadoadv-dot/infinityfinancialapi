export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  profileImageUrl?: string;
  roleProfile: {
    name: string;
    defaultPermissions: string[];
  }
}

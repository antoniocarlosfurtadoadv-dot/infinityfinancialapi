export interface UserPayload {
  id: string;
  email: string;
  role: string; // RoleProfile name (e.g. 'MASTER', 'ADMIN')
  roleDefaultPermissions: string[]; // Default permissions from the RoleProfile
  tenantId: string | null;
  mustChangePassword: boolean;
}

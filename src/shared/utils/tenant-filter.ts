import type { UserPayload } from 'src/shared/interfaces';

export function tenantFilter(tenantId: string | null): { tenantId: string } | Record<string, never> {
  return tenantId ? { tenantId } : {};
}

export function isSuperAdmin(user: UserPayload): boolean {
  return user.tenantId === null || user.tenantId === undefined;
}

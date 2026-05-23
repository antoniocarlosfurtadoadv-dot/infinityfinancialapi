import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { isSuperAdmin } from 'src/shared/utils/tenant-filter';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user || !isSuperAdmin(user)) {
      throw new ForbiddenException(
        'Acesso restrito a super administradores',
      );
    }

    return true;
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from 'src/core/database/prisma.service';
import { isSuperAdmin } from 'src/shared/utils/tenant-filter';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) return true; // JwtAuthGuard handles unauthenticated requests

    // Super-admins bypass subscription checks
    if (isSuperAdmin(user)) return true;

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId: user.tenantId },
      select: { status: true, trialEndsAt: true },
    });

    if (!subscription) {
      throw new ForbiddenException('Tenant sem assinatura ativa');
    }

    const { status, trialEndsAt } = subscription;

    if (status === 'TRIAL') {
      if (trialEndsAt && new Date() > trialEndsAt) {
        throw new ForbiddenException('Período de trial expirado');
      }
      return true;
    }

    if (status === 'ACTIVE' || status === 'PAST_DUE') {
      return true;
    }

    throw new ForbiddenException(
      `Acesso bloqueado: assinatura com status "${status}"`,
    );
  }
}

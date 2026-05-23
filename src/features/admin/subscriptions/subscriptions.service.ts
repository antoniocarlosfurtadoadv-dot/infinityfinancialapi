import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import {
  EventDispatcherService,
  SubscriptionCreatedEvent,
  SubscriptionPlanChangedEvent,
  SubscriptionCanceledEvent,
} from 'src/core/events';

import { AssignSubscriptionDto } from './dto/assign-subscription.dto';
import { ChangePlanDto } from './dto/change-plan.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async assign(dto: AssignSubscriptionDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Plano não encontrado');

    const existing = await this.prisma.subscription.findUnique({
      where: { tenantId: dto.tenantId },
    });
    if (existing) {
      throw new ConflictException(
        'Tenant já possui uma assinatura. Use o endpoint de troca de plano ou cancelamento.',
      );
    }

    const now = new Date();
    const trialDays = plan.trialDays ?? 0;
    const trialEndsAt = dto.trialEndsAt
      ? new Date(dto.trialEndsAt)
      : trialDays > 0
        ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
        : null;

    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId: dto.tenantId,
        planId: dto.planId,
        status: trialEndsAt ? 'TRIAL' : 'ACTIVE',
        trialEndsAt,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        notes: dto.notes,
      },
      include: { plan: true, tenant: true },
    });

    this.eventDispatcher.dispatch(
      EVENT_NAMES.SUBSCRIPTION_CREATED,
      new SubscriptionCreatedEvent(subscription.id, subscription.tenantId, subscription.planId),
    );

    return subscription;
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take: limit,
        include: { plan: true, tenant: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count(),
    ]);
    return { data, total, currentPage: page, limit };
  }

  async findByTenant(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true, invoices: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!subscription) throw new NotFoundException('Nenhuma assinatura encontrada para este tenant');
    return subscription;
  }

  async changePlan(id: string, dto: ChangePlanDto) {
    const subscription = await this.prisma.subscription.findUnique({ where: { id } });
    if (!subscription) throw new NotFoundException('Assinatura não encontrada');

    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Plano não encontrado');

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        planId: dto.planId,
        status: 'ACTIVE',
        canceledAt: null,
      },
      include: { plan: true },
    });

    this.eventDispatcher.dispatch(
      EVENT_NAMES.SUBSCRIPTION_PLAN_CHANGED,
      new SubscriptionPlanChangedEvent(id, dto.planId),
    );

    return updated;
  }

  async cancel(id: string) {
    const subscription = await this.prisma.subscription.findUnique({ where: { id } });
    if (!subscription) throw new NotFoundException('Assinatura não encontrada');

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELED', canceledAt: new Date() },
    });

    this.eventDispatcher.dispatch(
      EVENT_NAMES.SUBSCRIPTION_CANCELED,
      new SubscriptionCanceledEvent(id, subscription.tenantId),
    );

    return updated;
  }

  async listInvoices(id: string, page = 1, limit = 10) {
    const subscription = await this.prisma.subscription.findUnique({ where: { id } });
    if (!subscription) throw new NotFoundException('Assinatura não encontrada');

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { subscriptionId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where: { subscriptionId: id } }),
    ]);

    return { data, total, currentPage: page, limit };
  }
}

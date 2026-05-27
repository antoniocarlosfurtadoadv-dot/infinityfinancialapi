/* eslint-disable prettier/prettier */
import * as bcrypt from 'bcryptjs';

import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { Permission } from 'src/shared/enums';

const ALL_PERMISSIONS = Object.values(Permission);

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async run() {
    this.logger.log('Starting database seeding...');

    // 1. Create Tenant
    const tenant = await this.prisma.tenant.upsert({
      where: { id: 'seed-tenant-default' },
      update: {},
      create: {
        id: 'seed-tenant-default',
        name: 'Infinity Financial',
        description: 'Default tenant created by seed',
      },
    });
    this.logger.log(`Tenant ready: ${tenant.name} (${tenant.id})`);

    // 2. Create RoleProfile MASTER with all permissions
    const roleProfile = await this.prisma.roleProfile.upsert({
      where: { id: 'seed-role-master' },
      update: { defaultPermissions: ALL_PERMISSIONS },
      create: {
        id: 'seed-role-master',
        name: 'MASTER',
        description: 'Master role with all permissions',
        defaultPermissions: ALL_PERMISSIONS,
      },
    });
    this.logger.log(`RoleProfile ready: ${roleProfile.name} (${roleProfile.id})`);

    // 3. Create default plan
    const plan = await this.prisma.plan.upsert({
      where: { name: 'Infinity Seed Plan' },
      update: {
        description: 'Default plan created by seed',
        price: '99.90',
        billingCycle: 'MONTHLY',
        maxUsers: 50,
        maxStorageMb: 10240,
        features: ['dashboard', 'user-management', 'billing'],
        isActive: true,
        isPublic: true,
        trialDays: 0,
      },
      create: {
        name: 'Infinity Seed Plan',
        description: 'Default plan created by seed',
        price: '99.90',
        billingCycle: 'MONTHLY',
        maxUsers: 50,
        maxStorageMb: 10240,
        features: ['dashboard', 'user-management', 'billing'],
        isActive: true,
        isPublic: true,
        trialDays: 0,
      },
    });
    this.logger.log(`Plan ready: ${plan.name} (${plan.id})`);

    // 4. Create active subscription for tenant
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = await this.prisma.subscription.upsert({
      where: { tenantId: tenant.id },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        trialEndsAt: null,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        canceledAt: null,
        notes: 'Default active subscription created by seed',
      },
      create: {
        tenantId: tenant.id,
        planId: plan.id,
        status: 'ACTIVE',
        trialEndsAt: null,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        notes: 'Default active subscription created by seed',
      },
    });
    this.logger.log(
      `Subscription ready: ${subscription.id} (${subscription.status})`,
    );

    // 5. Create active user linked to tenant and role profile
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    const user = await this.prisma.user.upsert({
      where: { email: 'franciscothiago0111@gmail.com' },
      update: {},
      create: {
        name: 'Francisco Thiago',
        email: 'franciscothiago0111@gmail.com',
        password: hashedPassword,
        status: 'ACTIVE',
        mustChangePassword: false,
        roleProfileId: roleProfile.id,
        tenantId: tenant.id,
      },
    });
    this.logger.log(`User ready: ${user.email} (${user.id})`);

    this.logger.log('Done.');
    return true;
  }
}

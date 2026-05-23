import { Module } from '@nestjs/common';

import { AdminUsersModule } from './admin-users/admin-users.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [AdminUsersModule, PlansModule, SubscriptionsModule, InvoicesModule],
})
export class AdminModule {}

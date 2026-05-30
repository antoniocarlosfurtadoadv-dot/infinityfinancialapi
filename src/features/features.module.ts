import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RoleProfileModule } from './role-profile/role-profile.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    LogsModule,
    AdminModule,
    SeedModule,
    NotificationsModule,
    RoleProfileModule,
  ],
})
export class FeaturesModule {}

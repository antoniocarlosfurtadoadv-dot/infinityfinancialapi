import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { LogsModule } from './logs/logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RoleProfileModule } from './role-profile/role-profile.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    AdminModule,
    SeedModule,
    NotificationsModule,
    RoleProfileModule,
    LogsModule,
  ],
})
export class FeaturesModule {}

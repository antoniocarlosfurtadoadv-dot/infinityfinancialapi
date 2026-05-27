import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    AdminModule,
    SeedModule,
  ],
})
export class FeaturesModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { EmailModule } from 'src/core/integrations/email/email.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { IoGuard } from './guards/io.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthRefreshModule } from './auth-refresh/auth-refresh.module';
import { AuthMeModule } from './auth-me/auth-me.module';
import { AuthChangePasswordModule } from './auth-change-password/auth-change-password.module';
import { AuthVerifyCodeModule } from './auth-verify-code/auth-verify-code.module';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { AuthFirstAccessModule } from './auth-first-access/auth-first-access.module';

@Module({
  imports: [
    PassportModule,
    EmailModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: jwtConstants.expiresIn as any,
      },
    }),
    AuthRefreshModule,
    AuthMeModule,
    AuthChangePasswordModule,
    AuthVerifyCodeModule,
    ForgotPasswordModule,
    AuthFirstAccessModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, IoGuard],
  exports: [AuthService, JwtModule, IoGuard],
})
export class AuthModule {}

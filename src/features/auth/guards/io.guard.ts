import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserPayload } from 'src/shared/interfaces';

import { jwtConstants } from '../constants';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class IoGuard {
  constructor(private jwtService: JwtService) {}

  async checkToken(token: string): Promise<UserPayload> {
    if (!token) {
      throw new UnauthorizedException("Token é obrigatório");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtConstants.secret,
      });

      return {
        id: payload.sub,
        email: payload.email,
        role: payload.roleProfile.name,
        roleDefaultPermissions: payload.roleProfile.defaultPermissions,
        tenantId: payload.tenantId || null,
        mustChangePassword: false,
      };
    } catch (e) {
      throw new UnauthorizedException(e?.message);
    }
  }
}

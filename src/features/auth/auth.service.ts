import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from 'src/core/database/prisma.service';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import { NewDeviceAccessEvent } from 'src/core/events/events/new-device-access.event';
import { EventDispatcherService } from 'src/core/events/services/event-dispatcher.service';

import { jwtConstants } from './constants';
import { SignInDto } from './dto/signin.dto';
import { AuthDeviceContext } from './interfaces/auth-device-context.interface';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/** SHA-256 of a token — deterministic, so we can look up by hash with @unique */
export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

type AuthUserAccount = {
  id: string;
  email: string;
  name: string;
  password?: string;
  roleProfile?: {
    name: string;
    defaultPermissions: string[];
  } | null;
  tenantId?: string | null;
  mustChangePassword: boolean;
  profileImageUrl?: string | null;
  deletedAt?: Date | null;
};

type NormalizedDeviceInfo = {
  browser: string;
  os: string;
  deviceType: string;
  fingerprint: string;
  label: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  private normalizeDeviceValue(value?: string): string | undefined {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }

  private parseBrowser(userAgent: string): string {
    const browserMatchers: Array<{ regex: RegExp; name: string }> = [
      { regex: /edg\//i, name: 'Edge' },
      { regex: /opr\//i, name: 'Opera' },
      { regex: /chrome\//i, name: 'Chrome' },
      { regex: /firefox\//i, name: 'Firefox' },
      { regex: /safari\//i, name: 'Safari' },
      { regex: /msie|trident/i, name: 'Internet Explorer' },
    ];

    for (const matcher of browserMatchers) {
      if (matcher.regex.test(userAgent)) {
        return matcher.name;
      }
    }

    return 'Unknown';
  }

  private parseOs(userAgent: string): string {
    const osMatchers: Array<{ regex: RegExp; name: string }> = [
      { regex: /windows nt/i, name: 'Windows' },
      { regex: /android/i, name: 'Android' },
      { regex: /iphone|ipad|ipod/i, name: 'iOS' },
      { regex: /mac os x/i, name: 'macOS' },
      { regex: /linux/i, name: 'Linux' },
    ];

    for (const matcher of osMatchers) {
      if (matcher.regex.test(userAgent)) {
        return matcher.name;
      }
    }

    return 'Unknown';
  }

  private parseDeviceType(userAgent: string): string {
    if (/bot|crawler|spider|slurp/i.test(userAgent)) {
      return 'bot';
    }

    if (/ipad/i.test(userAgent) || /tablet/i.test(userAgent)) {
      return 'tablet';
    }

    if (/mobi|iphone|android/i.test(userAgent)) {
      return 'mobile';
    }

    return 'desktop';
  }

  private normalizeDeviceContext(
    deviceContext?: AuthDeviceContext,
  ): NormalizedDeviceInfo | undefined {
    // Build a stable device identity from coarse user-agent traits only.
    const userAgent = this.normalizeDeviceValue(deviceContext?.userAgent);

    if (!userAgent) {
      return undefined;
    }

    const browser = this.parseBrowser(userAgent);
    const os = this.parseOs(userAgent);
    const deviceType = this.parseDeviceType(userAgent);
    const fingerprintSource = `${browser}|${os}|${deviceType}`;

    return {
      browser,
      os,
      deviceType,
      fingerprint: crypto
        .createHash('sha256')
        .update(fingerprintSource)
        .digest('hex'),
      label: `${browser} on ${os} (${deviceType})`,
    };
  }

  private buildDeviceFingerprint(
    deviceContext?: AuthDeviceContext,
  ): string | undefined {
    return this.normalizeDeviceContext(deviceContext)?.fingerprint;
  }

  private buildDeviceLabel(deviceContext?: AuthDeviceContext): string {
    return (
      this.normalizeDeviceContext(deviceContext)?.label ??
      'Dispositivo desconhecido'
    );
  }

  private async hasRecentOrTrustedDevice(
    userId: string,
    deviceFingerprint?: string,
  ): Promise<boolean> {
    if (!deviceFingerprint) {
      return false;
    }

    // Reuse active refresh tokens as the trust source and suppress duplicate alerts for 24h.
    const recentWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [activeSession, recentSession] = await Promise.all([
      this.prisma.refreshToken.findFirst({
        where: {
          userId,
          revoked: false,
          deviceFingerprint,
        },
        select: { id: true },
      }),
      this.prisma.refreshToken.findFirst({
        where: {
          userId,
          deviceFingerprint,
          createdAt: {
            gte: recentWindowStart,
          },
        },
        select: { id: true },
      }),
    ]);

    return Boolean(activeSession || recentSession);
  }

  /**
   * Validate credentials and return tokens directly.
   */
  async signIn(
    signInDto: SignInDto,
    deviceContext?: AuthDeviceContext,
  ): Promise<AuthResponse> {
    this.logger.log(`Sign-in attempt: ${signInDto.email}`);

    const user = await this.prisma.user.findFirst({
      where: {
        email: signInDto.email,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        roleProfile: { select: { name: true, defaultPermissions: true } },
        tenantId: true,
        mustChangePassword: true,
        profileImageUrl: true,
      },
    });

    if (!user) {
      this.logger.warn(`Sign-in failed — user not found: ${signInDto.email}`);
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Sign-in failed — wrong password: ${signInDto.email}`);
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    this.logger.log(`Sign-in successful: ${user.email} (id=${user.id})`);

    const deviceFingerprint = this.buildDeviceFingerprint(deviceContext);
    const shouldAlertNewDevice = deviceFingerprint
      ? !(await this.hasRecentOrTrustedDevice(user.id, deviceFingerprint))
      : false;

    const response = await this.generateAuthResponse(
      {
        ...user,
      } as AuthUserAccount,
      deviceContext,
    );

    if (shouldAlertNewDevice) {
      this.eventDispatcher.dispatch(
        EVENT_NAMES.NEW_DEVICE_ACCESS,
        new NewDeviceAccessEvent(
          user.id,
          user.email,
          user.name,
          this.buildDeviceLabel(deviceContext),
          deviceContext?.ipAddress,
          user.tenantId ?? undefined,
        ),
      );
    }

    return response;
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleProfile: { select: { name: true, defaultPermissions: true } },
        tenantId: true,
        mustChangePassword: true,
      },
    });

    if (!user) {
      this.logger.warn(
        `Token validation failed — user not found: id=${userId}`,
      );
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      ...user,
      role: user.roleProfile?.name ?? '',
      roleDefaultPermissions: user.roleProfile?.defaultPermissions ?? [],
    };
  }

  /**
   * Called by JwtRefreshStrategy.
   * Returns user data + the DB record id so the controller can rotate the token.
   */
  async validateRefreshToken(userId: string, rawToken: string) {
    const tokenHash = hashToken(rawToken);

    const record = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            roleProfile: { select: { name: true } },
            tenantId: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!record || record.userId !== userId || record.user.deletedAt) {
      this.logger.warn(
        `Refresh token validation failed — record not found or user deleted: userId=${userId}`,
      );
      throw new ForbiddenException('Access denied');
    }

    // Reuse detection: token was already revoked — possible theft; wipe all sessions
    if (record.revoked) {
      this.logger.warn(
        `Refresh token reuse detected — revoking all sessions for userId=${userId}`,
      );
      await this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });
      throw new ForbiddenException('Access denied');
    }

    if (record.expiresAt < new Date()) {
      this.logger.warn(`Refresh token expired for userId=${userId}`);
      throw new ForbiddenException('Refresh token expired');
    }

    this.logger.log(`Refresh token validated for userId=${userId}`);

    return {
      id: record.user.id,
      email: record.user.email,
      name: record.user.name,
      role: record.user.roleProfile?.name ?? '',
      tenantId: record.user.tenantId,
      refreshTokenId: record.id,
    };
  }

  /** Used by sub-modules (auth-verify-code, auth-refresh) to issue tokens */
  async generateAuthResponse(
    user: AuthUserAccount,
    deviceContext?: AuthDeviceContext,
  ): Promise<AuthResponse> {
    if (user.deletedAt) {
      this.logger.warn(
        `generateAuthResponse blocked — user is deleted: id=${user.id}`,
      );
      throw new ForbiddenException('Access denied');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId ?? '',
      profileImageUrl: user.profileImageUrl ?? undefined,
      roleProfile: {
        name: user.roleProfile?.name ?? '',
        defaultPermissions: user.roleProfile?.defaultPermissions ?? [],
      },
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload as any, {
        secret: jwtConstants.secretRefresh,
        expiresIn: jwtConstants.refreshExpiresIn as any,
      }),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const normalizedDevice = this.normalizeDeviceContext(deviceContext);

    await this.prisma.refreshToken.create({
      data: {
        token: hashToken(refresh_token),
        userId: user.id,
        expiresAt,
        deviceFingerprint: normalizedDevice?.fingerprint,
        userAgent: this.normalizeDeviceValue(deviceContext?.userAgent),
        ipAddress: this.normalizeDeviceValue(deviceContext?.ipAddress),
      },
    });

    this.logger.log(`Tokens issued for userId=${user.id} (${user.email})`);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleProfile: {
          name: user.roleProfile?.name ?? '',
          defaultPermissions: user.roleProfile?.defaultPermissions ?? [],
        },
        mustChangePassword: user.mustChangePassword,
      },
    };
  }
}

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { CurrentUser } from 'src/shared/decorators';
import { ApiResponseService } from 'src/shared/services';
import type { UserPayload } from 'src/shared/interfaces';

import { AuthChangePasswordService } from './auth-change-password.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthChangePasswordController {
  constructor(
    private readonly authChangePasswordService: AuthChangePasswordService,
    private readonly responseService: ApiResponseService,
  ) {}

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: UserPayload,
    @Body() dto: ChangePasswordDto,
    @Req() request: Request,
  ) {
    const forwardedFor = request.headers['x-forwarded-for'];
    const userAgentHeader = request.headers['user-agent'];

    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim() ||
      request.ip ||
      request.socket.remoteAddress ||
      undefined;

    const userAgent = Array.isArray(userAgentHeader)
      ? userAgentHeader[0]
      : userAgentHeader || undefined;

    await this.authChangePasswordService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
      {
        userAgent,
        ipAddress,
      },
    );
    return this.responseService.success({
      message: 'Password changed successfully',
    });
  }
}

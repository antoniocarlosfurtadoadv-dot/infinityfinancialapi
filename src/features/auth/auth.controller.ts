import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { ApiResponseService } from 'src/shared/services';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInDto } from './dto/signin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto, @Req() request: Request) {
    // Capture request context for device detection without changing login behavior.
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

    const result = await this.authService.signIn(signInDto, {
      userAgent,
      ipAddress,
    });

    // First-time login - verification code sent
    if ('pendingUserId' in result) {
      return this.responseService.success({
        message: 'Verification code sent to your email',
        data: result,
      });
    }

    // Returning user - tokens issued directly
    return this.responseService.success({
      message: 'Login successful',
      data: result,
    });
  }
}

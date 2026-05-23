import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/shared/decorators';
import { ApiResponseService } from 'src/shared/services';
import type { UserPayload } from 'src/shared/interfaces';

import { Public } from '../decorators/public.decorator';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { AuthRefreshService } from './auth-refresh.service';

@ApiTags('auth')
@Controller('auth')
export class AuthRefreshController {
  constructor(
    private readonly authRefreshService: AuthRefreshService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @CurrentUser() user: UserPayload & { refreshTokenId: string },
  ) {
    const result = await this.authRefreshService.refresh(
      user.id,
      user.refreshTokenId,
    );
    return this.responseService.success({
      message: 'Tokens refreshed successfully',
      data: result,
    });
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@CurrentUser() user: UserPayload) {
    await this.authRefreshService.logout(user.id);
    return this.responseService.success({
      message: 'Logged out successfully',
      data: null,
    });
  }
}

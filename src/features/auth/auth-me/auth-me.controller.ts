import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/shared/decorators';
import { ApiResponseService } from 'src/shared/services';
import type { UserPayload } from 'src/shared/interfaces';

import { AuthMeService } from './auth-me.service';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthMeController {
  constructor(
    private readonly authMeService: AuthMeService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Get('me')
  async getMe(@CurrentUser() user: UserPayload) {
    const result = await this.authMeService.getMe(user.id);
    return this.responseService.success({
      message: 'User retrieved successfully',
      data: result,
    });
  }
}

import { Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiResponseService } from 'src/shared/services';
import { Permissions } from 'src/shared/decorators';
import { Permission } from 'src/shared/enums';

import { UserResendFirstAccessLinkService } from './user-resend-first-access-link.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserResendFirstAccessLinkController {
  constructor(
    private readonly userResendFirstAccessLinkService: UserResendFirstAccessLinkService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Post(':id/resend-first-access')
  @Permissions(Permission.GESTAO_GERENCIAR_USUARIOS)
  @ApiOperation({ summary: 'Resend first access link to a pending user' })
  async resend(@Param('id') id: string) {
    await this.userResendFirstAccessLinkService.resend(id);

    return this.responseService.success({
      message: 'First access link resent successfully',
    });
  }
}

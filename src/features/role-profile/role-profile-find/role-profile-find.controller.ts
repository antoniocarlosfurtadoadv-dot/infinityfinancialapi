import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Permissions } from 'src/shared/decorators';
import { ApiResponseService } from 'src/shared/services';
import type { UserPayload } from 'src/shared/interfaces';
import { Permission } from 'src/shared/enums';

import { RoleProfileFindService } from './role-profile-find.service';

@ApiTags('role-profiles')
@ApiBearerAuth()
@Controller('role-profiles')
export class RoleProfileFindController {
  constructor(
    private readonly roleProfileFindService: RoleProfileFindService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Get(':id')
  @Permissions(Permission.GESTAO_GERENCIAR_PERFIS)
  @ApiOperation({ summary: 'Get role profile by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const roleProfile = await this.roleProfileFindService.findOne(id, user);
    return this.responseService.success({
      message: 'Role profile retrieved successfully',
      data: roleProfile,
    });
  }
}

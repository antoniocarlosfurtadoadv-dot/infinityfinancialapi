import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Permissions } from 'src/shared/decorators';
import { ApiResponseService } from 'src/shared/services';
import type { UserPayload } from 'src/shared/interfaces';
import { Permission } from 'src/shared/enums';

import { RoleProfileCreateService } from './role-profile-create.service';
import { RoleProfileCreateDto } from './dto/role-profile-create.dto';

@ApiTags('role-profiles')
@ApiBearerAuth()
@Controller('role-profiles')
export class RoleProfileCreateController {
  constructor(
    private readonly roleProfileCreateService: RoleProfileCreateService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Post()
  @Permissions(Permission.GESTAO_GERENCIAR_PERFIS)
  @ApiOperation({ summary: 'Create a role profile' })
  async create(@Body() dto: RoleProfileCreateDto, @CurrentUser() currentUser: UserPayload) {
    const roleProfile = await this.roleProfileCreateService.create(dto, currentUser);
    return this.responseService.success({
      message: 'Role profile created successfully',
      data: roleProfile,
    });
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Permissions } from 'src/shared/decorators';
import { ApiResponseService } from 'src/shared/services';
import type { UserPayload } from 'src/shared/interfaces';
import { Permission } from 'src/shared/enums';

import { RoleProfileListService } from './role-profile-list.service';
import { RoleProfileListDto } from './dto/role-profile-list.dto';

@ApiTags('role-profiles')
@ApiBearerAuth()
@Controller('role-profiles')
export class RoleProfileListController {
  constructor(
    private readonly roleProfileListService: RoleProfileListService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Get()
  @Permissions(Permission.GESTAO_GERENCIAR_PERFIS)
  @ApiOperation({ summary: 'List all role profiles' })
  async list(@CurrentUser() user: UserPayload, @Query() query: RoleProfileListDto) {
    const result = await this.roleProfileListService.list(user, query);
    return this.responseService.pagination({
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      limit: result.limit,
      message: 'Role profiles retrieved successfully',
    });
  }
}

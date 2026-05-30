import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Permissions } from 'src/shared/decorators';
import { ApiResponseService } from 'src/shared/services';
import type { UserPayload } from 'src/shared/interfaces';
import { Permission } from 'src/shared/enums';

import { RoleProfileUpdateService } from './role-profile-update.service';
import { RoleProfileUpdateDto } from './dto/role-profile-update.dto';

@ApiTags('role-profiles')
@ApiBearerAuth()
@Controller('role-profiles')
export class RoleProfileUpdateController {
  constructor(
    private readonly roleProfileUpdateService: RoleProfileUpdateService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Patch(':id')
  @Permissions(Permission.GESTAO_GERENCIAR_PERFIS)
  @ApiOperation({ summary: 'Update role profile by ID' })
  async update(
    @Param('id') id: string,
    @Body() dto: RoleProfileUpdateDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const roleProfile = await this.roleProfileUpdateService.update(id, dto, currentUser);
    return this.responseService.success({
      message: 'Role profile updated successfully',
      data: roleProfile,
    });
  }
}

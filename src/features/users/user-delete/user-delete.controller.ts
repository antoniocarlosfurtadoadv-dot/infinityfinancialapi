import { Controller, Delete, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';


import type { UserPayload } from 'src/shared/interfaces';
import { ApiResponseService } from 'src/shared/services';

import { UserDeleteService } from './user-delete.service';
import { CurrentUser, Permissions } from 'src/shared/decorators';
import { Permission } from 'src/shared/enums';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserDeleteController {
  constructor(
    private readonly userDeleteService: UserDeleteService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Delete(':id')
  @Permissions(Permission.GESTAO_GERENCIAR_USUARIOS)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires permission',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const result = await this.userDeleteService.delete(id, user);
    return this.responseService.success({
      message: 'User deleted successfully',
      data: result,
    });
  }
}

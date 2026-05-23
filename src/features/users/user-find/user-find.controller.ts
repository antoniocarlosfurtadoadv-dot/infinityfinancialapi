import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CurrentUser, Permissions } from 'src/shared/decorators';
import type { UserPayload } from 'src/shared/interfaces';
import { ApiResponseService } from 'src/shared/services';
import { Permission } from 'src/shared/enums';
import { UserFindService } from './user-find.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserFindController {
  constructor(
    private readonly userFindService: UserFindService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Get(':id')
  @Permissions(Permission.GESTAO_GERENCIAR_USUARIOS)
  @ApiOperation({ summary: 'Get a user by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const foundUser = await this.userFindService.findOne(id, user);
    return this.responseService.success({
      message: 'User retrieved successfully',
      data: foundUser,
    });
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';


import { ApiResponseService } from 'src/shared/services';

import { UserListDto } from './dto/user-list.dto';
import { UserListService } from './user-list.service';
import { CurrentUser, Permissions } from 'src/shared/decorators';
import { Permission } from 'src/shared/enums';
import type { UserPayload } from 'src/shared/interfaces';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserListController {
  constructor(
    private readonly userListService: UserListService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Get()
  @Permissions(Permission.GESTAO_GERENCIAR_USUARIOS)
  @ApiOperation({ summary: 'List all users' })
  async listUsers(
    @CurrentUser() user: UserPayload,
    @Query() query: UserListDto,
  ) {
    const result = await this.userListService.list(user, query);
    // return this.responseService.success({
    //   message: 'Users retrieved successfully',
    //   data: users,
    // });
    return this.responseService.pagination({
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      limit: result.limit,
      message: 'Users retrieved successfully',
    });
  }
}

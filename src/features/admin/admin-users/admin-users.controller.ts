import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SuperAdminGuard } from 'src/features/auth/guards/super-admin.guard';
import { ApiResponseService } from 'src/shared/services';

import { AdminUsersCreateService } from './admin-users-create.service';
import { AdminUsersListService } from './admin-users-list.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

@ApiTags('admin / users')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly createService: AdminUsersCreateService,
    private readonly listService: AdminUsersListService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a super-admin user' })
  async create(@Body() dto: CreateAdminUserDto) {
    const user = await this.createService.create(dto);
    return this.responseService.success({ message: 'Super-admin criado com sucesso', data: user });
  }

  @Get()
  @ApiOperation({ summary: 'List all super-admin users' })
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.listService.list(Number(page) || 1, Number(limit) || 10);
    return this.responseService.success({ data: result });
  }
}

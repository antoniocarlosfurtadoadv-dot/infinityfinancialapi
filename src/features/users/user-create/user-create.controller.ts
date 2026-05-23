import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiResponseService } from 'src/shared/services';

import { CreateUserDto } from './dto/create-user.dto';
import { UserCreateService } from './user-create.service';
import { Permissions, CurrentUser } from 'src/shared/decorators';
import { Permission } from 'src/shared/enums';
import type { UserPayload } from 'src/shared/interfaces';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserCreateController {
  constructor(
    private readonly userCreateService: UserCreateService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Post()
  @Permissions(Permission.GESTAO_GERENCIAR_USUARIOS)
  @ApiOperation({ summary: 'Create a new user' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: UserPayload,
  ) {
    const newUser = await this.userCreateService.create(createUserDto, user);

    return this.responseService.success({
      message: 'User created successfully',
      data: newUser,
    });
  }
}

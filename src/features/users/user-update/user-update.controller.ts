import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { ApiResponseService } from 'src/shared/services';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserUpdateService } from './user-update.service';
import { Permissions, CurrentUser } from 'src/shared/decorators';
import { Permission } from 'src/shared/enums';
import type { UserPayload } from 'src/shared/interfaces';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserUpdateController {
  constructor(
    private readonly userUpdateService: UserUpdateService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Put(':id')
  @Permissions(Permission.GESTAO_GERENCIAR_USUARIOS)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userUpdateService.update(
      id,
      updateUserDto,
      user,
    );
    return this.responseService.success({
      message: 'User updated successfully',
      data: updatedUser,
    });
  }
}

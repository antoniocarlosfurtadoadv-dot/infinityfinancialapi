import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser, Permissions } from 'src/shared/decorators';
import { Permission } from 'src/shared/enums';
import type { UserPayload } from 'src/shared/interfaces';
import { ApiResponseService } from 'src/shared/services';
import { UserUploadService } from './user-upload.service';


@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserUploadController {
  constructor(
    private readonly userUploadService: UserUploadService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Post('upload')
  @Permissions(Permission.GESTAO_GERENCIAR_USUARIOS)
  @ApiOperation({ summary: 'Upload profile image for the current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() currentUser: UserPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.userUploadService.uploadProfileImage(
      currentUser.id,
      file,
    );

    return this.responseService.success({
      message: 'Profile image uploaded successfully',
      data: result,
    });
  }
}

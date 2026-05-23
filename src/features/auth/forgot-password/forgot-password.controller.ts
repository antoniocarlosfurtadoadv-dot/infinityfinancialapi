import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponseService } from 'src/shared/services';
import { Public } from '../decorators/public.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';



@ApiTags('auth')
@Controller('auth')
export class ForgotPasswordController {
  constructor(
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly responseService: ApiResponseService,
  ) {}


  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.forgotPasswordService.forgotPassword(forgotPasswordDto);

    return this.responseService.success({
      message: 'Código enviado com sucesso',
      data: result,
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.forgotPasswordService.resetPassword(resetPasswordDto);

    return this.responseService.success({
      message: 'Senha alterada com sucesso',
      data: null,
    });
  }
}

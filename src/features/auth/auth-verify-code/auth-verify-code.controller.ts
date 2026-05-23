import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiResponseService } from 'src/shared/services';

import { Public } from '../decorators/public.decorator';
import { AuthVerifyCodeService } from './auth-verify-code.service';
import { VerifyCodeDto } from './dto/verify-code.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthVerifyCodeController {
  constructor(
    private readonly authVerifyCodeService: AuthVerifyCodeService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-code')
  async verifyCode(@Body() dto: VerifyCodeDto) {
    const result = await this.authVerifyCodeService.verifyCode(dto);
    return this.responseService.success({
      message: 'Código verificado com sucesso',
      data: result,
    });
  }
}

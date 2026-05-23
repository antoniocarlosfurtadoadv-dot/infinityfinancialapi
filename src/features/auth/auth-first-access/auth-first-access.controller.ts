import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiResponseService } from 'src/shared/services';

import { Public } from '../decorators/public.decorator';
import { AuthFirstAccessService } from './auth-first-access.service';
import { FirstAccessValidateDto } from './dto/first-access-validate.dto';
import { FirstAccessVerifyDto } from './dto/first-access-verify.dto';
import { FirstAccessCompleteDto } from './dto/first-access-complete.dto';
import { FirstAccessRequestDto } from './dto/first-access-request.dto';

@ApiTags('auth')
@Controller('auth/first-access')
export class AuthFirstAccessController {
  constructor(
    private readonly authFirstAccessService: AuthFirstAccessService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('request')
  async request(@Body() dto: FirstAccessRequestDto) {
    const result = await this.authFirstAccessService.request(dto);
    return this.responseService.success({
      message: 'Novo link de primeiro acesso enviado.',
      data: result,
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('validate')
  async validate(@Body() dto: FirstAccessValidateDto) {
    const result = await this.authFirstAccessService.validate(dto);
    return this.responseService.success({
      message: 'Token válido',
      data: result,
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  async verify(@Body() dto: FirstAccessVerifyDto) {
    const result = await this.authFirstAccessService.verify(dto);
    return this.responseService.success({
      message: 'Verificação concluída.',
      data: result,
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('complete')
  async complete(@Body() dto: FirstAccessCompleteDto) {
    const result = await this.authFirstAccessService.complete(dto);
    return this.responseService.success({
      message: 'Senha criada com sucesso.',
      data: result,
    });
  }
}

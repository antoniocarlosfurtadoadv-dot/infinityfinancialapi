import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { Public } from 'src/features/auth/decorators/public.decorator';
import { ApiResponseService } from 'src/shared/services';

import { SeedService } from './seed.service';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(
    private readonly seedService: SeedService,
    private readonly responseService: ApiResponseService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run database seed (requires x-seed-key header)' })
  @ApiHeader({ name: 'x-seed-key', description: 'Secret key to authorize seeding', required: true })
  async runSeed(@Headers('x-seed-key') seedKey: string) {
    const expectedKey = this.configService.get<string>('SEED_KEY');

    if (!expectedKey || seedKey !== expectedKey) {
      throw new ForbiddenException('Invalid or missing seed key');
    }

    const result = await this.seedService.run();

    return this.responseService.success({
      message: 'Seed executed successfully',
      data: result,
    });
  }
}

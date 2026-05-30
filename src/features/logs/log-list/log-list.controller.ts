import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponseService } from 'src/shared/services';
import type { UserPayload } from 'src/shared/interfaces';
import { CurrentUser, Permissions } from 'src/shared/decorators';
import { Permission } from 'src/shared/enums';


import { LogListDto } from './dto/log-list.dto';
import { LogListService } from './log-list.service';

@ApiTags('logs')
@Controller('logs')
@ApiBearerAuth()
export class LogListController {
  constructor(
    private readonly logListService: LogListService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Get()
  @Permissions(Permission.GESTAO_VISUALIZAR_LOGS)
  @ApiOperation({ summary: 'Get list of logs' })
  async list(
    @CurrentUser() user: UserPayload,
    @Query() logListDto: LogListDto,
  ) {
    const result = await this.logListService.list(user, logListDto);
    return this.responseService.pagination({
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      limit: result.limit,
      message: 'Logs retrieved successfully',
    });
  }
}

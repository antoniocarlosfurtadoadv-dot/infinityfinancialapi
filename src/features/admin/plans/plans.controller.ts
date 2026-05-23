import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SuperAdminGuard } from 'src/features/auth/guards/super-admin.guard';
import { ApiResponseService } from 'src/shared/services';

import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlansService } from './plans.service';

@ApiTags('admin / plans')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin/plans')
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a plan' })
  async create(@Body() dto: CreatePlanDto) {
    const plan = await this.plansService.create(dto);
    return this.responseService.success({ message: 'Plano criado com sucesso', data: plan });
  }

  @Get()
  @ApiOperation({ summary: 'List all plans' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('onlyActive') onlyActive?: boolean,
  ) {
    const result = await this.plansService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      onlyActive === true || String(onlyActive) === 'true',
    );
    return this.responseService.success({ data: result });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a plan by id' })
  async findOne(@Param('id') id: string) {
    const plan = await this.plansService.findOne(id);
    return this.responseService.success({ data: plan });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a plan' })
  async update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    const plan = await this.plansService.update(id, dto);
    return this.responseService.success({ message: 'Plano atualizado', data: plan });
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a plan (soft delete)' })
  async deactivate(@Param('id') id: string) {
    const plan = await this.plansService.deactivate(id);
    return this.responseService.success({ message: 'Plano desativado', data: plan });
  }
}

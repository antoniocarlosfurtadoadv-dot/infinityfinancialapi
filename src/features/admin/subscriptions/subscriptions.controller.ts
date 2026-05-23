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

import { AssignSubscriptionDto } from './dto/assign-subscription.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('admin / subscriptions')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin/subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Assign a plan to a tenant' })
  async assign(@Body() dto: AssignSubscriptionDto) {
    const result = await this.subscriptionsService.assign(dto);
    return this.responseService.success({ message: 'Assinatura criada com sucesso', data: result });
  }

  @Get()
  @ApiOperation({ summary: 'List all subscriptions' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.subscriptionsService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
    );
    return this.responseService.success({ data: result });
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: "Get a tenant's subscription" })
  async findByTenant(@Param('tenantId') tenantId: string) {
    const result = await this.subscriptionsService.findByTenant(tenantId);
    return this.responseService.success({ data: result });
  }

  @Patch(':id/plan')
  @ApiOperation({ summary: 'Change the plan of a subscription' })
  async changePlan(@Param('id') id: string, @Body() dto: ChangePlanDto) {
    const result = await this.subscriptionsService.changePlan(id, dto);
    return this.responseService.success({ message: 'Plano alterado com sucesso', data: result });
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  async cancel(@Param('id') id: string) {
    const result = await this.subscriptionsService.cancel(id);
    return this.responseService.success({ message: 'Assinatura cancelada', data: result });
  }

  @Get(':id/invoices')
  @ApiOperation({ summary: 'List invoices for a subscription' })
  async listInvoices(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.subscriptionsService.listInvoices(
      id,
      Number(page) || 1,
      Number(limit) || 10,
    );
    return this.responseService.success({ data: result });
  }
}

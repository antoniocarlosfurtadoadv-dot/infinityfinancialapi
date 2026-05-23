import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SuperAdminGuard } from 'src/features/auth/guards/super-admin.guard';
import { ApiResponseService } from 'src/shared/services';

import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('admin / invoices')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin/invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly responseService: ApiResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all invoices' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.invoicesService.findAll(Number(page) || 1, Number(limit) || 10);
    return this.responseService.success({ data: result });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by id' })
  async findOne(@Param('id') id: string) {
    const result = await this.invoicesService.findOne(id);
    return this.responseService.success({ data: result });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Manually update invoice status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    const result = await this.invoicesService.updateStatus(id, dto);
    return this.responseService.success({ message: 'Status da fatura atualizado', data: result });
  }
}

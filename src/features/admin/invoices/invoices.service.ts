import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { EVENT_NAMES } from 'src/core/events/constants/event-names.constant';
import { EventDispatcherService, InvoicePaidEvent } from 'src/core/events';

import { UpdateInvoiceStatusDto, InvoiceStatusDto } from './dto/update-invoice-status.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        skip,
        take: limit,
        include: { subscription: { select: { tenantId: true, plan: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count(),
    ]);
    return { data, total, currentPage: page, limit };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { subscription: { include: { plan: true, tenant: { select: { id: true, name: true } } } } },
    });
    if (!invoice) throw new NotFoundException('Fatura não encontrada');
    return invoice;
  }

  async updateStatus(id: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Fatura não encontrada');

    const paidAt =
      dto.status === InvoiceStatusDto.PAID ? new Date() : invoice.paidAt;

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: dto.status, paidAt },
    });

    if (dto.status === InvoiceStatusDto.PAID) {
      this.eventDispatcher.dispatch(EVENT_NAMES.INVOICE_PAID, new InvoicePaidEvent(id));
    }

    return updated;
  }
}

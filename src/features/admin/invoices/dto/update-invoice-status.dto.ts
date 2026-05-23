import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum InvoiceStatusDto {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatusDto })
  @IsEnum(InvoiceStatusDto)
  status: InvoiceStatusDto;
}

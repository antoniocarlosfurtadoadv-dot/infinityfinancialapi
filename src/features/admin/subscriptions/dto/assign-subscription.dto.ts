import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export enum BillingCycleDto {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export class AssignSubscriptionDto {
  @ApiProperty({ description: 'Tenant to assign the plan to' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Plan id to assign' })
  @IsUUID()
  planId: string;

  @ApiPropertyOptional({ description: 'Override trial end date (ISO 8601). If omitted, computed from plan.trialDays' })
  @IsOptional()
  @IsISO8601()
  trialEndsAt?: string;

  @ApiPropertyOptional({ description: 'Internal notes for this subscription' })
  @IsOptional()
  @IsString()
  notes?: string;
}

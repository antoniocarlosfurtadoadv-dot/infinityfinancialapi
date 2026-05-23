import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export enum BillingCycleDto {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export class CreatePlanDto {
  @ApiProperty({ example: 'Pro' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Full access plan' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 99.9 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: BillingCycleDto, default: BillingCycleDto.MONTHLY })
  @IsEnum(BillingCycleDto)
  billingCycle: BillingCycleDto;

  @ApiPropertyOptional({ example: 20, description: 'null = unlimited' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;

  @ApiPropertyOptional({ example: 5120, description: 'Max storage in MB, null = unlimited' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxStorageMb?: number;

  @ApiPropertyOptional({ type: [String], example: ['ROTAS', 'AI_PROCESSING'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ example: 14, description: 'Free trial days' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  trialDays?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// src/common/dto/base-query.dto.ts
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class BaseQueryDto {
  // Paginação
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000000000)
  @Type(() => Number)
  limit?: number = 10;

  // Filtros comuns
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', 'enabled', '1', 'yes'].includes(value.toLowerCase());
    }
    return value === 1;
  })
  disabled?: boolean;

  // Outros filtros comuns que você pode adicionar
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', 'active', '1', 'yes'].includes(value.toLowerCase());
    }
    return value === 1;
  })
  active?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string; // Busca genérica em múltiplos campos
}

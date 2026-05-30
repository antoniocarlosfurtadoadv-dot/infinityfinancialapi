import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RoleProfileUpdateDto {
  @ApiPropertyOptional({ example: 'Veterinarian' })
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: ['read:pets', 'write:exams'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultPermissions?: string[];


  @IsString()
  @IsOptional()
  description?: string;
}

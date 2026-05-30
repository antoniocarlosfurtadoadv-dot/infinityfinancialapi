import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleProfileCreateDto {
  @ApiProperty({ example: 'Veterinarian' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: ['read:pets', 'write:exams'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultPermissions?: string[];


  @IsString()
  @IsOptional()
  description?: string;
}

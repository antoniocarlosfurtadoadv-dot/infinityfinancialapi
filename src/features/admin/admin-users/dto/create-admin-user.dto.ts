import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, MinLength, IsOptional } from 'class-validator';

export class CreateAdminUserDto {
  @ApiProperty({ example: 'Admin Name' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'admin@system.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'RoleProfile to assign' })
  @IsOptional()
  @IsUUID()
  roleProfileId?: string;
}

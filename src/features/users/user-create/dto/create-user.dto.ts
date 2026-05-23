import { IsString, IsEmail, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User name', example: 'João Silva' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role profile ID to assign to the user',
    example: 'uuid-of-the-role-profile',
  })
  @IsUUID()
  roleProfileId: string;
}

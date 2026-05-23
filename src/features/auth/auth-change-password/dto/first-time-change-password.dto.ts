import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class FirstTimeChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  pendingUserId: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

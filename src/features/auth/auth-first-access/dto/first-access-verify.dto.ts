import { IsBoolean, IsString, IsNotEmpty } from 'class-validator';

export class FirstAccessVerifyDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsBoolean()
  termsAccepted: boolean;
}

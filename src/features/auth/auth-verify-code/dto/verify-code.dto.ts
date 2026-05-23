import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @IsString()
  @Length(4, 4)
  code: string;
}

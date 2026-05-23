import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class FirstAccessCompleteDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Senha muito fraca. Use no mínimo 8 caracteres' })
  newPassword: string;
}

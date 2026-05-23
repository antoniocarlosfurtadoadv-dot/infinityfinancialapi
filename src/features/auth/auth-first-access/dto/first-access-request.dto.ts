import { IsEmail } from 'class-validator';

export class FirstAccessRequestDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;
}

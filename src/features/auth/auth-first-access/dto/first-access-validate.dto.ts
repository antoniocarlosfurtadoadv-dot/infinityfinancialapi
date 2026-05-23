import { IsString, IsNotEmpty } from 'class-validator';

export class FirstAccessValidateDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

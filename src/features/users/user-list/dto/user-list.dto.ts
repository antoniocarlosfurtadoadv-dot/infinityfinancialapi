import { IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from 'src/shared/dto';


export class UserListDto extends BaseQueryDto {
  @IsString()
  @IsOptional()
  roleProfileId?: string;
}

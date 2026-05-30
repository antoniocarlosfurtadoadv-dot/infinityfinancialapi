import { IsBoolean, IsOptional } from 'class-validator';
import { BaseQueryDto } from 'src/shared/dto';


export class NotificationListDto extends BaseQueryDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}

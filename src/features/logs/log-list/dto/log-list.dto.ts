import { IsOptional } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from 'src/shared/dto';


export class LogListDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Filter Entity',
    example: 'Team',
  })
  @IsOptional()
  entity?: string;
}

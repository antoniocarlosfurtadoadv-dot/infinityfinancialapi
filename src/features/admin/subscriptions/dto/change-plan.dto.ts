import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ChangePlanDto {
  @ApiProperty({ description: 'New plan id' })
  @IsUUID()
  planId: string;
}

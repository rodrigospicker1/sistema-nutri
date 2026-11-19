import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { StatusSafra } from '../../../common/enums/index.js';

export class SafraMensalDto {
  @ApiProperty({ minimum: 1, maximum: 12, example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @ApiProperty({ enum: StatusSafra })
  @IsEnum(StatusSafra)
  status: StatusSafra;
}

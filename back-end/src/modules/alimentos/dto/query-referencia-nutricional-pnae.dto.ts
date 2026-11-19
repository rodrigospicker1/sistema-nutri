import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ToBoolean } from '../../../common/transforms/to-boolean.transform.js';

export class QueryReferenciaNutricionalPnaeDto {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  ativo?: boolean;
}

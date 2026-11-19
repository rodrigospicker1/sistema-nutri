import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';
import { ToBoolean } from '../../../common/transforms/to-boolean.transform.js';

export class QueryEmpenhoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  contratoHortiId?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  ativo?: boolean;
}

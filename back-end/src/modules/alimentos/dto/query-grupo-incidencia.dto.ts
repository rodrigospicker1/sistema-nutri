import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { OrigemRegraIncidencia } from '../../../common/enums/index.js';
import { ToBoolean } from '../../../common/transforms/to-boolean.transform.js';

export class QueryGrupoIncidenciaDto {
  @ApiPropertyOptional({ description: 'Trecho do nome, sem diferenciar maiúsculas' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: OrigemRegraIncidencia })
  @IsOptional()
  @IsEnum(OrigemRegraIncidencia)
  origemRegra?: OrigemRegraIncidencia;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  ativo?: boolean;
}

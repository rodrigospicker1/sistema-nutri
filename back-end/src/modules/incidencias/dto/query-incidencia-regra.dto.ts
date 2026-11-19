import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PeriodoIncidencia } from '../../../common/enums/index.js';

export class QueryIncidenciaRegraDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  agrupamentoCardapioId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  contratoTerceirizadaId?: string;

  @ApiPropertyOptional({ enum: PeriodoIncidencia })
  @IsOptional()
  @IsEnum(PeriodoIncidencia)
  periodo?: PeriodoIncidencia;
}

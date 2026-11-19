import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min, Validate } from 'class-validator';
import { PeriodoIncidencia, TipoAlvoIncidencia } from '../../../common/enums/index.js';
import { AlvoRegraConstraint } from './alvo-regra.validator.js';

export class CreateIncidenciaRegraDto {
  @ApiPropertyOptional({ nullable: true, description: 'Nulo quando a regra é da Lei do PNAE. Identificador externo do contrato da terceirizada.' })
  @IsOptional()
  @IsString()
  contratoTerceirizadaId?: string | null;

  @ApiProperty()
  @IsMongoId()
  agrupamentoCardapioId: string;

  @ApiProperty({ enum: TipoAlvoIncidencia })
  @IsEnum(TipoAlvoIncidencia)
  @Validate(AlvoRegraConstraint)
  tipoAlvo: TipoAlvoIncidencia;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsMongoId()
  grupoIncidenciaId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsMongoId()
  fichaTecnicaId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsMongoId()
  alimentoId?: string | null;

  @ApiProperty({ enum: PeriodoIncidencia })
  @IsEnum(PeriodoIncidencia)
  periodo: PeriodoIncidencia;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  frequenciaMinima?: number | null;

  @ApiPropertyOptional({ nullable: true, description: '0 proíbe o alvo naquele agrupamento' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  frequenciaMaxima?: number | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
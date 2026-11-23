import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsInt, IsMongoId, IsNumber, IsOptional, ValidateNested } from 'class-validator';

export class RateioEmpenhoDto {
  @ApiProperty()
  @IsMongoId()
  empenhoId: string;

  @ApiProperty()
  @IsNumber()
  quantidade: number;
}

export class AlocacaoAlimentoDto {
  @ApiProperty()
  @IsMongoId()
  alimentoId: string;

  @ApiProperty({ type: [RateioEmpenhoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateioEmpenhoDto)
  rateios: RateioEmpenhoDto[];
}

export class SimularListaComprasDto {
  @ApiPropertyOptional({ description: 'Opcional: restringe candidatos de empenho e itens de contrato a este contrato; ausente/vazio = todos os contratos ativos' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsMongoId()
  contratoHortiId?: string;

  @ApiProperty({ type: [String], format: 'date-time' })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Date)
  @IsDate({ each: true })
  datasConsumo: Date[];

  @ApiPropertyOptional({ type: [AlocacaoAlimentoDto], description: 'Rateio de empenhos por alimento; quando enviado, valida saldo e cobertura' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlocacaoAlimentoDto)
  alocacoes?: AlocacaoAlimentoDto[];

  @ApiPropertyOptional({ description: 'Somente no gerar: grava como RASCUNHO (não abate o saldo dos empenhos)' })
  @IsOptional()
  @IsBoolean()
  rascunho?: boolean;

  @ApiPropertyOptional({ type: [Number], description: 'Restringe o cálculo a estas etapas de ensino (vazio/ausente = todas)' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  erudioEtapaIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'Restringe o cálculo a estas unidades de ensino (vazio/ausente = todas)' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  erudioUnidadeEnsinoIds?: number[];
}

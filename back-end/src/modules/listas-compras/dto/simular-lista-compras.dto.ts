import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDate, IsMongoId, IsNumber, IsOptional, ValidateNested } from 'class-validator';

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
  @ApiProperty()
  @IsMongoId()
  contratoHortiId: string;

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
}

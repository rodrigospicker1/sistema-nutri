import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { TipoEventoContrato, UnidadeMedida } from '../../../common/enums/index.js';

export const EVENTOS_ALTERACAO_ITEM = [
  TipoEventoContrato.INCLUSAO_ALIMENTO,
  TipoEventoContrato.REAJUSTE_PRECO,
  TipoEventoContrato.ACRESCIMO_QUANTIDADE,
  TipoEventoContrato.INATIVACAO_ALIMENTO,
] as const;

function numeroOuNulo({ value }: { value: unknown }): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === '') {
    return null;
  }
  return typeof value === 'number' ? value : Number(value);
}

export class RegistrarAlteracaoItemDto {
  @ApiProperty({ enum: EVENTOS_ALTERACAO_ITEM })
  @IsIn(EVENTOS_ALTERACAO_ITEM)
  tipoEvento: (typeof EVENTOS_ALTERACAO_ITEM)[number];

  @ApiProperty({ example: 'Aditivo 03/2026' })
  @IsString()
  @MinLength(1)
  numeroDocumento: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  dataVigencia: Date;

  @ApiProperty()
  @IsMongoId()
  alimentoId: string;

  @ApiProperty({ example: 'Reajuste previsto no aditivo' })
  @IsString()
  @MinLength(1)
  motivo: string;

  @ApiProperty({ description: 'Identificador do usuário autor da alteração' })
  @IsString()
  @MinLength(1)
  autorUsuarioId: string;

  @ApiPropertyOptional({ enum: UnidadeMedida })
  @IsOptional()
  @IsEnum(UnidadeMedida)
  unidadeMedida?: UnidadeMedida;

  @ApiPropertyOptional({ description: 'Novo preço unitário no reajuste ou na inclusão' })
  @Type(() => Number)
  @ValidateIf(
    (dto: RegistrarAlteracaoItemDto) =>
      dto.tipoEvento === TipoEventoContrato.REAJUSTE_PRECO || dto.valorNovo !== undefined,
  )
  @IsNumber()
  @Min(0)
  valorNovo?: number;

  @ApiPropertyOptional({ description: 'Nova quantidade total licitada no acréscimo ou na inclusão' })
  @Type(() => Number)
  @ValidateIf(
    (dto: RegistrarAlteracaoItemDto) =>
      dto.tipoEvento === TipoEventoContrato.ACRESCIMO_QUANTIDADE || dto.qtdNova !== undefined,
  )
  @IsNumber()
  @Min(0)
  qtdNova?: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(numeroOuNulo)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0)
  perCapita?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(numeroOuNulo)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0)
  fatorCorrecao?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Gramas por unidade de compra (MACO/UNIDADE/DUZIA/LITRO)' })
  @IsOptional()
  @Transform(numeroOuNulo)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0)
  gramasPorUnidade?: number | null;

  @ApiPropertyOptional({ type: [Number], example: [1, 3, 5] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  diasSemanaEntrega?: number[];
}

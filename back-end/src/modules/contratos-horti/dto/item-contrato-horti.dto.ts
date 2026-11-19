import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { UnidadeMedida } from '../../../common/enums/index.js';

function numeroOuNulo({ value }: { value: unknown }): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return typeof value === 'number' ? value : Number(value);
}

export class ItemContratoHortiDto {
  @ApiProperty()
  @IsMongoId()
  alimentoId: string;

  @ApiProperty({ enum: UnidadeMedida })
  @IsEnum(UnidadeMedida)
  unidadeMedida: UnidadeMedida;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  qtdTotalLicitada: number;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valorUnitario: number;

  @ApiPropertyOptional({ nullable: true, description: 'Per capita. Nulo quando não se aplica.' })
  @IsOptional()
  @Transform(numeroOuNulo)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0)
  perCapita?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Fator de correção. Nulo quando não se aplica.' })
  @IsOptional()
  @Transform(numeroOuNulo)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0)
  fatorCorrecao?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Gramas por unidade de compra (MACO/UNIDADE/DUZIA/LITRO). Nulo para KG/GRAMA.' })
  @IsOptional()
  @Transform(numeroOuNulo)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0)
  gramasPorUnidade?: number | null;

  @ApiProperty({ type: [Number], example: [1, 3, 5], description: 'Dias da semana, 0 = domingo a 6 = sábado' })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  diasSemanaEntrega: number[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

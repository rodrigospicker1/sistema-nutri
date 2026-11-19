import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsMongoId, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateCardapioDto {
  @ApiProperty({ example: 'Berçário 1 — Modelo semanal' })
  @IsString()
  @MinLength(1)
  nome: string;

  @ApiPropertyOptional({ enum: ['MODELO', 'MENSAL'], default: 'MODELO' })
  @IsOptional()
  @IsIn(['MODELO', 'MENSAL'])
  tipo?: 'MODELO' | 'MENSAL';

  @ApiProperty()
  @IsMongoId()
  agrupamentoCardapioId: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5, description: 'Semanas da grade (só para MODELO)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  quantidadeSemanas?: number;

  @ApiPropertyOptional({ type: [String], example: ['LANCHE_MANHA_1', 'ALMOCO'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  refeicoes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoesCozinha?: string;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  nutricionistasResponsaveisIds?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  ano?: number;
}

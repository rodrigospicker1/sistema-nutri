import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IngredienteFichaDto } from './ingrediente-ficha.dto.js';
import { PorcaoEtapaFichaDto } from './porcao-etapa-ficha.dto.js';

export class CreateFichaTecnicaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modoPreparo?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rendimentoTotalGramas?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fatorCoccao?: number;

  @ApiPropertyOptional({ type: [IngredienteFichaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredienteFichaDto)
  ingredientes?: IngredienteFichaDto[];

  @ApiPropertyOptional({ type: [PorcaoEtapaFichaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PorcaoEtapaFichaDto)
  porcoesEtapa?: PorcaoEtapaFichaDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  gruposIncidenciaIds?: string[];
}

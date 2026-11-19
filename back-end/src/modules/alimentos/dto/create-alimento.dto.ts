import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CategoriaAlimento, UnidadeMedida } from '../../../common/enums/index.js';
import { ComposicaoNutricionalDto } from './composicao-nutricional.dto.js';
import { MesesSafraUnicos } from './meses-safra-unicos.validator.js';
import { RestricaoEtapaFndeDto } from './restricao-etapa-fnde.dto.js';
import { SafraMensalDto } from './safra-mensal.dto.js';

export class CreateAlimentoDto {
  @ApiProperty({ example: 'Banana prata' })
  @IsString()
  nome: string;

  @ApiProperty({ enum: CategoriaAlimento })
  @IsEnum(CategoriaAlimento)
  categoria: CategoriaAlimento;

  @ApiProperty({ enum: UnidadeMedida })
  @IsEnum(UnidadeMedida)
  unidadeMedidaPadrao: UnidadeMedida;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  gruposIncidenciaIds?: string[];

  @ApiPropertyOptional({ type: ComposicaoNutricionalDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ComposicaoNutricionalDto)
  composicaoNutricional?: ComposicaoNutricionalDto;

  @ApiPropertyOptional({ type: [SafraMensalDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SafraMensalDto)
  @MesesSafraUnicos()
  safraMensal?: SafraMensalDto[];

  @ApiPropertyOptional({ type: [RestricaoEtapaFndeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestricaoEtapaFndeDto)
  restricoesEtapaFnde?: RestricaoEtapaFndeDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

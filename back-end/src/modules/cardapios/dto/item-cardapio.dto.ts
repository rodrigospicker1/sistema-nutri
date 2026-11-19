import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { OperadorItemRefeicao } from '../../../common/enums/index.js';

export class EmpenhoIngredienteDto {
  @ApiProperty()
  @IsMongoId()
  alimentoId: string;

  @ApiProperty()
  @IsMongoId()
  empenhoId: string;
}

export class ItemCardapioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ enum: ['FICHA', 'ALIMENTO'] })
  @IsString()
  origem: 'FICHA' | 'ALIMENTO';

  @ApiPropertyOptional({ enum: OperadorItemRefeicao, nullable: true })
  @IsOptional()
  @IsEnum(OperadorItemRefeicao)
  operador?: OperadorItemRefeicao | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativoParaCompra?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  fichaTecnicaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  alimentoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  perCapitaLiquido?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  perCapitaBruto?: number;

  @ApiPropertyOptional({ description: 'Peso pronto servido por aluno (ficha técnica); omitido = receita-base inteira' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  porcaoServidaGramas?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  empenhoId?: string;

  @ApiPropertyOptional({ type: [EmpenhoIngredienteDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmpenhoIngredienteDto)
  empenhosIngredientes?: EmpenhoIngredienteDto[];
}

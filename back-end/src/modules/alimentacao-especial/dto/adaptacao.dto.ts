import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class ItemOverrideDto {
  @ApiPropertyOptional({ enum: ['E', 'OU', null] })
  @IsOptional()
  @IsString()
  operador?: 'E' | 'OU' | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativoParaCompra?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fichaTecnicaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alimentoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  perCapitaBruto?: number;

  @ApiPropertyOptional({ description: 'Peso pronto servido por aluno (ficha técnica)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  porcaoServidaGramas?: number;
}

export class AdaptacaoOverrideDto {
  @ApiProperty({ description: 'Dia do cardápio alterado (YYYY-MM-DD)' })
  @IsDateString()
  data: string;

  @ApiProperty({ description: 'Id da refeição substituída (tipos_refeicao)' })
  @IsString()
  refeicao: string;

  @ApiProperty({ type: [ItemOverrideDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOverrideDto)
  itens: ItemOverrideDto[];
}

export class CreateAdaptacaoDto {
  @ApiProperty()
  @IsString()
  cardapioId: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiPropertyOptional({ description: 'Menor vence quando o aluno cai em mais de um perfil' })
  @IsOptional()
  @IsNumber()
  prioridade?: number;

  @ApiPropertyOptional({ type: [String], description: 'Restrições cobertas (junção)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restricoesIds?: string[];
}

export class UpdateAdaptacaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  prioridade?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restricoesIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class SalvarOverridesDto {
  @ApiProperty({ type: [AdaptacaoOverrideDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AdaptacaoOverrideDto)
  overrides: AdaptacaoOverrideDto[];
}

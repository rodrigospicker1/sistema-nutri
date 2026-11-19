import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ConfiguracaoAlmocoUnidadeDto {
  @ApiProperty()
  @IsNumber()
  erudioUnidadeEnsinoId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nomeEscola?: string;

  @ApiProperty({ description: 'Se a unidade serve o almoço do aluno em contraturno' })
  @IsBoolean()
  ofereceAlmocoContraturno: boolean;
}

export class SalvarAlmocoContraturnoDto {
  @ApiProperty({ enum: ['TURNO_MATUTINO', 'TURNO_VESPERTINO'], description: 'Desempate quando ambas as unidades oferecem almoço' })
  @IsIn(['TURNO_MATUTINO', 'TURNO_VESPERTINO'])
  alocacaoAlmocoContraturnoPadrao: 'TURNO_MATUTINO' | 'TURNO_VESPERTINO';

  @ApiProperty({ type: [ConfiguracaoAlmocoUnidadeDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ConfiguracaoAlmocoUnidadeDto)
  unidades: ConfiguracaoAlmocoUnidadeDto[];
}

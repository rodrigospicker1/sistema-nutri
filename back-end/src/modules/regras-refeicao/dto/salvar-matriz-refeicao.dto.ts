import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class RegraRefeicaoTurnoItemDto {
  @ApiProperty()
  @IsNumber()
  erudioEtapaId: number;

  @ApiProperty()
  @IsNumber()
  erudioTurnoId: number;

  @ApiPropertyOptional({ nullable: true, description: 'Nulo = regra geral da etapa/turno' })
  @IsOptional()
  @IsNumber()
  erudioUnidadeEnsinoId?: number | null;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  refeicaoIds: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class SalvarMatrizRefeicaoDto {
  @ApiProperty({ type: [RegraRefeicaoTurnoItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RegraRefeicaoTurnoItemDto)
  regras: RegraRefeicaoTurnoItemDto[];
}

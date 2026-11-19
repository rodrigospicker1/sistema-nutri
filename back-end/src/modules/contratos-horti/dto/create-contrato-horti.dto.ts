import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsOptional, IsString, Matches, MinLength, ValidateNested } from 'class-validator';
import { ItemContratoHortiDto } from './item-contrato-horti.dto.js';

export class CreateContratoHortiDto {
  @ApiProperty({ example: '045/2026' })
  @IsString()
  @MinLength(1)
  numeroContrato: string;

  @ApiProperty({ example: 'KMJ Hortifruti' })
  @IsString()
  @MinLength(1)
  fornecedorNome: string;

  @ApiProperty({ example: '18442233000190' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsString()
  @Matches(/^\d{14}$/, { message: 'fornecedorCnpj deve conter 14 dígitos' })
  fornecedorCnpj: string;

  @ApiProperty({ description: 'Entra na meta legal de 45% de agricultura familiar do PNAE' })
  @IsBoolean()
  agriculturaFamiliar: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  vigenciaInicio: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  vigenciaFim: Date;

  @ApiProperty()
  @IsBoolean()
  arredondamentoTotalAlimentos: boolean;

  @ApiPropertyOptional({ type: [ItemContratoHortiDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemContratoHortiDto)
  itens?: ItemContratoHortiDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

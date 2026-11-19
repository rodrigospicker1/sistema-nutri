import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAgrupamentoCardapioDto {
  @ApiProperty({ example: 'Berçário 1 (6 a 11 meses)' })
  @IsString()
  @MinLength(1)
  nome: string;

  @ApiPropertyOptional({ example: 'B1' })
  @IsOptional()
  @IsString()
  sigla?: string;

  @ApiProperty({ type: [Number], example: [101] })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  erudioEtapaIds: number[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

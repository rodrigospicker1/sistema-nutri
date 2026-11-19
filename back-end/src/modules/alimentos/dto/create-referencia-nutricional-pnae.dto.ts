import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateReferenciaNutricionalPnaeDto {
  @ApiProperty()
  @IsMongoId()
  agrupamentoCardapioId: string;

  @ApiProperty({ example: 'Berçário 1 — refeição principal' })
  @IsString()
  descricaoFaixa: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  kcalMin: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  kcalMax: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proteinaMin: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proteinaMax: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lipidiosMin: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lipidiosMax: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carboidratosMin: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carboidratosMax: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  calcioMin: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  calcioMax: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ferroMin: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ferroMax: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vitaminaAMin: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vitaminaAMax: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vitaminaCMin: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vitaminaCMax: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sodioMin: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sodioMax: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

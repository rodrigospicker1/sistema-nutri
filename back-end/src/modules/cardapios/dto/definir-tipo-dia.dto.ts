import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { TipoDiaCardapio } from '../../../common/enums/index.js';

export class DefinirTipoDiaDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  numeroSemana: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  diaSemana: number;

  @ApiProperty({ enum: TipoDiaCardapio })
  @IsEnum(TipoDiaCardapio)
  tipoDia: TipoDiaCardapio;
}

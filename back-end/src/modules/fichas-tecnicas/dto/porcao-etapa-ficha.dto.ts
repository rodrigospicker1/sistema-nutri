import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class PorcaoEtapaFichaDto {
  @ApiProperty({ example: 101 })
  @Type(() => Number)
  @IsInt()
  erudioEtapaId: number;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantidadeGramas: number;
}

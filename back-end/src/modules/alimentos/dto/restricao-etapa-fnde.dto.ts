import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { NivelRestricaoFnde } from '../../../common/enums/index.js';

export class RestricaoEtapaFndeDto {
  @ApiProperty({ example: 12, description: 'Identificador numérico da etapa no Erudio' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  erudioEtapaId: number;

  @ApiProperty({ enum: NivelRestricaoFnde })
  @IsEnum(NivelRestricaoFnde)
  nivel: NivelRestricaoFnde;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoriaAlimento } from '../../../common/enums/index.js';
import { ToBoolean } from '../../../common/transforms/to-boolean.transform.js';

export class QueryAlimentoDto {
  @ApiPropertyOptional({ description: 'Trecho do nome, sem diferenciar maiúsculas' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: CategoriaAlimento })
  @IsOptional()
  @IsEnum(CategoriaAlimento)
  categoria?: CategoriaAlimento;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  ativo?: boolean;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsMongoId, IsOptional } from 'class-validator';
import {
  STATUS_LISTA_COMPRAS,
  type StatusListaCompras,
} from '../schemas/lista-compras.schema.js';

export class QueryListaComprasDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsMongoId()
  contratoHortiId?: string;

  @ApiPropertyOptional({ enum: STATUS_LISTA_COMPRAS })
  @IsOptional()
  @IsIn(STATUS_LISTA_COMPRAS)
  status?: StatusListaCompras;
}

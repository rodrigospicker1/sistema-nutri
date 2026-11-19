import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { StatusCardapio } from '../../../common/enums/index.js';
import { PartialType } from '@nestjs/swagger';
import { CreateCardapioDto } from './create-cardapio.dto.js';

export class UpdateCardapioDto extends PartialType(CreateCardapioDto) {
  @ApiPropertyOptional({ enum: StatusCardapio })
  @IsOptional()
  @IsEnum(StatusCardapio)
  status?: StatusCardapio;
}

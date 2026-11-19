import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ItemContratoHortiDto } from './item-contrato-horti.dto.js';

export class UpdateItensContratoDto {
  @ApiProperty({ type: [ItemContratoHortiDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemContratoHortiDto)
  itens: ItemContratoHortiDto[];
}

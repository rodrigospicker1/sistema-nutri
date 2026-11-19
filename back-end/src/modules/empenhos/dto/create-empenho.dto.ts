import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsMongoId, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { ItemEmpenhoDto } from './item-empenho.dto.js';

export class CreateEmpenhoDto {
  @ApiProperty({ description: 'Contrato de hortifruti ao qual o empenho reserva saldo' })
  @IsMongoId()
  contratoHortiId: string;

  @ApiProperty({ example: '2026NE000123' })
  @IsString()
  @MinLength(1)
  numeroEmpenho: string;

  @ApiProperty({ example: 'PNAE - Agricultura familiar', description: 'Fonte de recurso ou dotação' })
  @IsString()
  @MinLength(1)
  fonteRecurso: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  dataInicio: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  dataFim: Date;

  @ApiProperty({ type: [ItemEmpenhoDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemEmpenhoDto)
  itensEmpenhados: ItemEmpenhoDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

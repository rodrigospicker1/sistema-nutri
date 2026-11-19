import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsMongoId, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { UnidadeMedida } from '../../../common/enums/index.js';
import { PrevisaoMensalEmpenhoDto } from './previsao-mensal-empenho.dto.js';

export class ItemEmpenhoDto {
  @ApiProperty()
  @IsMongoId()
  alimentoId: string;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  qtdEmpenhada: number;

  @ApiPropertyOptional({ enum: UnidadeMedida, description: 'Omitida = herda a unidade do item de contrato' })
  @IsOptional()
  @IsEnum(UnidadeMedida)
  unidadeMedida?: UnidadeMedida;

  @ApiPropertyOptional({ nullable: true, description: 'Gramas por unidade; omitida herda do contrato, divergente é rejeitada' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  gramasPorUnidade?: number | null;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valorUnitario: number;

  @ApiPropertyOptional({ type: [PrevisaoMensalEmpenhoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrevisaoMensalEmpenhoDto)
  previsaoMensal?: PrevisaoMensalEmpenhoDto[];
}

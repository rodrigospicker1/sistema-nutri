import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from '../../../common/transforms/to-boolean.transform.js';

export class QueryContratoHortiDto {
  @ApiPropertyOptional({ description: 'Trecho do nome do fornecedor' })
  @IsOptional()
  @IsString()
  fornecedorNome?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: 'Filtra contratos que compõem a meta de agricultura familiar' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  agriculturaFamiliar?: boolean;
}

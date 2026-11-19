import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoriaVisualGrupoIncidencia, OrigemRegraIncidencia } from '../../../common/enums/index.js';

export class CreateGrupoIncidenciaDto {
  @ApiProperty({ example: 'Frutas in natura' })
  @IsString()
  nome: string;

  @ApiPropertyOptional({ enum: CategoriaVisualGrupoIncidencia, default: CategoriaVisualGrupoIncidencia.OUTROS })
  @IsOptional()
  @IsEnum(CategoriaVisualGrupoIncidencia)
  categoriaVisual?: CategoriaVisualGrupoIncidencia;

  @ApiProperty({ enum: OrigemRegraIncidencia })
  @IsEnum(OrigemRegraIncidencia)
  origemRegra: OrigemRegraIncidencia;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

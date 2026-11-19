import { PartialType } from '@nestjs/swagger';
import { CreateGrupoIncidenciaDto } from './create-grupo-incidencia.dto.js';

export class UpdateGrupoIncidenciaDto extends PartialType(CreateGrupoIncidenciaDto) {}

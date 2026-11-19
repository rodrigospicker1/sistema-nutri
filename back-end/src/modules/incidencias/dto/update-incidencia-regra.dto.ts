import { PartialType } from '@nestjs/swagger';
import { CreateIncidenciaRegraDto } from './create-incidencia-regra.dto.js';

export class UpdateIncidenciaRegraDto extends PartialType(CreateIncidenciaRegraDto) {}

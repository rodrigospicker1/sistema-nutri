import { PartialType } from '@nestjs/swagger';
import { CreateReferenciaNutricionalPnaeDto } from './create-referencia-nutricional-pnae.dto.js';

export class UpdateReferenciaNutricionalPnaeDto extends PartialType(CreateReferenciaNutricionalPnaeDto) {}

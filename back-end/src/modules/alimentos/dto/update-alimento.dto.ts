import { PartialType } from '@nestjs/swagger';
import { CreateAlimentoDto } from './create-alimento.dto.js';

export class UpdateAlimentoDto extends PartialType(CreateAlimentoDto) {}

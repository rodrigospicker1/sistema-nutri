import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateContratoHortiDto } from './create-contrato-horti.dto.js';

export class UpdateContratoHortiDto extends PartialType(OmitType(CreateContratoHortiDto, ['itens'] as const)) {}

import { PartialType } from '@nestjs/swagger';
import { CreateEmpenhoDto } from './create-empenho.dto.js';

export class UpdateEmpenhoDto extends PartialType(CreateEmpenhoDto) {}

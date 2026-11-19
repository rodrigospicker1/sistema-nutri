import { Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { ValidarCardapioIncidenciaService } from './validar-cardapio.service.js';
import type { ResultadoIncidencia } from './validar-incidencias.js';

@ApiTags('Cardápios')
@Controller('cardapios')
export class ValidarCardapioIncidenciaController {
  constructor(private readonly validarService: ValidarCardapioIncidenciaService) {}

  @Post(':id/validar-incidencias')
  @ApiOperation({ summary: 'Valida frequências mínimas, máximas e itens proibidos do cardápio' })
  validar(@Param('id', ParseObjectIdPipe) id: string): Promise<ResultadoIncidencia> {
    return this.validarService.validar(id);
  }
}

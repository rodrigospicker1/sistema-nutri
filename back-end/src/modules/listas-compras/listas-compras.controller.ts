import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SimularListaComprasDto } from './dto/simular-lista-compras.dto.js';
import { ListasComprasService } from './listas-compras.service.js';

@ApiTags('Listas de compras')
@Controller('listas-compras')
export class ListasComprasController {
  constructor(private readonly listasComprasService: ListasComprasService) {}

  @Post('simular')
  @ApiOperation({ summary: 'Calcula o romaneio sem abater o saldo dos empenhos' })
  simular(@Body() dto: SimularListaComprasDto) {
    return this.listasComprasService.simular(dto);
  }

  @Post('gerar')
  @ApiOperation({ summary: 'Grava a lista e abate o saldo disponível dos empenhos' })
  gerar(@Body() dto: SimularListaComprasDto) {
    return this.listasComprasService.gerar(dto);
  }
}

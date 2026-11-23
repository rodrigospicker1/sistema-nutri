import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { QueryListaComprasDto } from './dto/query-lista-compras.dto.js';
import { SimularListaComprasDto } from './dto/simular-lista-compras.dto.js';
import { ListasComprasService } from './listas-compras.service.js';
import type { ListaComprasDocument } from './schemas/lista-compras.schema.js';

@ApiTags('Listas de compras')
@Controller('listas-compras')
export class ListasComprasController {
  constructor(private readonly listasComprasService: ListasComprasService) {}

  @Post('simular')
  @ApiOperation({ summary: 'Calcula o romaneio e sugere o rateio entre empenhos sem gravar' })
  simular(@Body() dto: SimularListaComprasDto) {
    return this.listasComprasService.simular(dto);
  }

  @Post('gerar')
  @ApiOperation({ summary: 'Grava a lista (CONFIRMADA por padrão, RASCUNHO com rascunho=true) e abate o saldo dos empenhos' })
  gerar(@Body() dto: SimularListaComprasDto): Promise<ListaComprasDocument> {
    return this.listasComprasService.gerar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as listas de compras filtrando por contrato e status' })
  findAll(@Query() query: QueryListaComprasDto): Promise<ListaComprasDocument[]> {
    return this.listasComprasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma lista de compras pelo identificador' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<ListaComprasDocument> {
    return this.listasComprasService.findOne(id);
  }

  @Patch(':id/confirmar')
  @ApiOperation({ summary: 'Confirma um rascunho após revalidar o saldo dos empenhos' })
  confirmar(@Param('id', ParseObjectIdPipe) id: string): Promise<ListaComprasDocument> {
    return this.listasComprasService.confirmar(id);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancela a lista e libera o saldo dos empenhos' })
  cancelar(@Param('id', ParseObjectIdPipe) id: string): Promise<ListaComprasDocument> {
    return this.listasComprasService.cancelar(id);
  }
}

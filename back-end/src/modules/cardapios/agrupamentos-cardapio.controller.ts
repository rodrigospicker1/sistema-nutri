import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgrupamentosCardapioService } from './agrupamentos-cardapio.service.js';
import { CreateAgrupamentoCardapioDto } from './dto/create-agrupamento-cardapio.dto.js';
import type { AgrupamentoCardapioDocument } from './schemas/agrupamento-cardapio.schema.js';

@ApiTags('Agrupamentos de cardápio')
@Controller('agrupamentos-cardapio')
export class AgrupamentosCardapioController {
  constructor(private readonly agrupamentosService: AgrupamentosCardapioService) {}

  @Post()
  @ApiOperation({ summary: 'Cria agrupamento de etapas para cardápios' })
  create(@Body() dto: CreateAgrupamentoCardapioDto): Promise<AgrupamentoCardapioDocument> {
    return this.agrupamentosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista agrupamentos de cardápio' })
  findAll(): Promise<AgrupamentoCardapioDocument[]> {
    return this.agrupamentosService.findAll();
  }
}

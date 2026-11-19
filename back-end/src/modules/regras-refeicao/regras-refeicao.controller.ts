import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalvarMatrizRefeicaoDto } from './dto/salvar-matriz-refeicao.dto.js';
import { RegrasRefeicaoService } from './regras-refeicao.service.js';

@ApiTags('Regras de refeição por turno')
@Controller()
export class RegrasRefeicaoController {
  constructor(private readonly service: RegrasRefeicaoService) {}

  @Get('tipos-refeicao')
  @ApiOperation({ summary: 'Lista o catálogo de tipos de refeição' })
  listarTipos() {
    return this.service.listarTipos();
  }

  @Post('tipos-refeicao')
  @ApiOperation({ summary: 'Cadastra um tipo de refeição' })
  criarTipo(@Body() dto: { id: string; nome: string; ordem?: number; ativo?: boolean }) {
    return this.service.criarTipo(dto);
  }

  @Patch('tipos-refeicao/:id')
  @ApiOperation({ summary: 'Atualiza um tipo de refeição' })
  atualizarTipo(@Param('id') id: string, @Body() dto: { nome?: string; ordem?: number; ativo?: boolean }) {
    return this.service.atualizarTipo(id, dto);
  }

  @Delete('tipos-refeicao/:id')
  @ApiOperation({ summary: 'Remove um tipo de refeição sem uso em regras ativas' })
  removerTipo(@Param('id') id: string) {
    return this.service.removerTipo(id);
  }

  @Get('regras-refeicao')
  @ApiOperation({ summary: 'Lista a matriz de refeições permitidas por etapa/turno' })
  listarRegras(
    @Query('erudioEtapaId') erudioEtapaId?: string,
    @Query('erudioTurnoId') erudioTurnoId?: string,
    @Query('erudioUnidadeEnsinoId') erudioUnidadeEnsinoId?: string,
  ) {
    return this.service.listarRegras({
      erudioEtapaId: erudioEtapaId ? Number(erudioEtapaId) : undefined,
      erudioTurnoId: erudioTurnoId ? Number(erudioTurnoId) : undefined,
      erudioUnidadeEnsinoId: erudioUnidadeEnsinoId ? Number(erudioUnidadeEnsinoId) : undefined,
    });
  }

  @Put('regras-refeicao/lote')
  @ApiOperation({ summary: 'Salva em lote as refeições permitidas por etapa/turno' })
  salvarMatriz(@Body() dto: SalvarMatrizRefeicaoDto) {
    return this.service.salvarMatriz(dto);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlimentacaoEspecialService } from './alimentacao-especial.service.js';
import { CreateAdaptacaoDto, SalvarOverridesDto, UpdateAdaptacaoDto } from './dto/adaptacao.dto.js';

@ApiTags('Alimentação especial')
@Controller()
export class AlimentacaoEspecialController {
  constructor(private readonly service: AlimentacaoEspecialService) {}

  @Get('tipos-restricao')
  @ApiOperation({ summary: 'Catálogo de restrições alimentares' })
  listarTipos() {
    return this.service.listarTiposRestricao();
  }

  @Post('tipos-restricao')
  @ApiOperation({ summary: 'Cadastra uma restrição alimentar' })
  criarTipo(@Body() dto: { id: string; nome: string; ativo?: boolean }) {
    return this.service.criarTipoRestricao(dto);
  }

  @Patch('tipos-restricao/:id')
  @ApiOperation({ summary: 'Atualiza uma restrição alimentar' })
  atualizarTipo(@Param('id') id: string, @Body() dto: { nome?: string; ativo?: boolean }) {
    return this.service.atualizarTipoRestricao(id, dto);
  }

  @Delete('tipos-restricao/:id')
  @ApiOperation({ summary: 'Remove uma restrição sem uso em laudos' })
  removerTipo(@Param('id') id: string) {
    return this.service.removerTipoRestricao(id);
  }

  @Get('restricoes-ativas')
  @ApiOperation({ summary: 'Restrições com laudos DEFERIDO por etapa, com contagem de alunos' })
  restricoesAtivas(@Query('erudioEtapaId') erudioEtapaId?: string) {
    return this.service.restricoesAtivas(erudioEtapaId ? Number(erudioEtapaId) : undefined);
  }

  @Get('adaptacoes-cardapio')
  @ApiOperation({ summary: 'Lista perfis de adaptação (com overrides)' })
  listarAdaptacoes(
    @Query('cardapioId') cardapioId?: string,
    @Query('erudioEtapaId') erudioEtapaId?: string,
  ) {
    return this.service.listarAdaptacoes({
      cardapioId,
      erudioEtapaId: erudioEtapaId ? Number(erudioEtapaId) : undefined,
    });
  }

  @Post('adaptacoes-cardapio')
  @ApiOperation({ summary: 'Cria um perfil de adaptação' })
  criarAdaptacao(@Body() dto: CreateAdaptacaoDto) {
    return this.service.criarAdaptacao(dto);
  }

  @Patch('adaptacoes-cardapio/:id')
  @ApiOperation({ summary: 'Atualiza nome, prioridade, restrições e status do perfil' })
  atualizarAdaptacao(@Param('id') id: string, @Body() dto: UpdateAdaptacaoDto) {
    return this.service.atualizarAdaptacao(id, dto);
  }

  @Delete('adaptacoes-cardapio/:id')
  @ApiOperation({ summary: 'Remove o perfil e seus overrides' })
  removerAdaptacao(@Param('id') id: string) {
    return this.service.removerAdaptacao(id);
  }

  @Put('adaptacoes-cardapio/:id/overrides')
  @ApiOperation({ summary: 'Salva em lote os overrides (delta) do perfil' })
  salvarOverrides(@Param('id') id: string, @Body() dto: SalvarOverridesDto) {
    return this.service.salvarOverrides(id, dto);
  }

  @Delete('adaptacoes-cardapio/:id/overrides')
  @ApiOperation({ summary: 'Remove um override — a refeição volta a herdar o cardápio principal' })
  removerOverride(@Param('id') id: string, @Query('data') data: string, @Query('refeicao') refeicao: string) {
    return this.service.removerOverride(id, data, refeicao);
  }

  @Get('adaptacoes-cardapio/:id/cardapio')
  @ApiOperation({ summary: 'Cardápio do perfil consolidado (principal + overrides)' })
  cardapioConsolidado(@Param('id') id: string) {
    return this.service.cardapioConsolidado(id);
  }
}

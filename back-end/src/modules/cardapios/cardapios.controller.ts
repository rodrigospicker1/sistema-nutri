import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CardapiosService } from './cardapios.service.js';
import { ClonarCardapioDto } from './dto/clonar-cardapio.dto.js';
import { CreateCardapioDto } from './dto/create-cardapio.dto.js';
import { DefinirTipoDiaDto } from './dto/definir-tipo-dia.dto.js';
import { ItemCardapioDto } from './dto/item-cardapio.dto.js';
import { UpdateCardapioDto } from './dto/update-cardapio.dto.js';
import type { CardapioDocument } from './schemas/cardapio.schema.js';

@ApiTags('Cardápios')
@Controller('cardapios')
export class CardapiosController {
  constructor(private readonly cardapiosService: CardapiosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria cardápio modelo (ou mensal) com grade vazia' })
  create(@Body() dto: CreateCardapioDto): Promise<CardapioDocument> {
    return this.cardapiosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista cardápios' })
  findAll(): Promise<CardapioDocument[]> {
    return this.cardapiosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca cardápio pelo identificador' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<CardapioDocument> {
    return this.cardapiosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados do cardápio (status, nome, observações)' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateCardapioDto): Promise<CardapioDocument> {
    return this.cardapiosService.update(id, dto);
  }

  @Post(':id/clonar')
  @ApiOperation({ summary: 'Clona um cardápio modelo para um mês/ano com status Novo' })
  clonar(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: ClonarCardapioDto): Promise<CardapioDocument> {
    return this.cardapiosService.clonar(id, dto);
  }

  @Patch(':id/dias/tipo')
  @ApiOperation({ summary: 'Define o tipo do dia (letivo, feriado, recesso, reunião)' })
  definirTipoDia(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: DefinirTipoDiaDto): Promise<CardapioDocument> {
    return this.cardapiosService.definirTipoDia(id, dto);
  }

  @Post(':id/dias/:semana/:diaSemana/refeicoes/:refeicao/itens')
  @ApiOperation({ summary: 'Adiciona item de ficha ou alimento na refeição do dia' })
  adicionarItem(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('semana', ParseIntPipe) semana: number,
    @Param('diaSemana', ParseIntPipe) diaSemana: number,
    @Param('refeicao') refeicao: string,
    @Body() dto: ItemCardapioDto,
  ): Promise<CardapioDocument> {
    return this.cardapiosService.adicionarItem(id, semana, diaSemana, refeicao, dto);
  }

  @Delete(':id/dias/:semana/:diaSemana/refeicoes/:refeicao/itens/:itemId')
  @ApiOperation({ summary: 'Remove item da refeição do dia' })
  removerItem(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('semana', ParseIntPipe) semana: number,
    @Param('diaSemana', ParseIntPipe) diaSemana: number,
    @Param('refeicao') refeicao: string,
    @Param('itemId') itemId: string,
  ): Promise<CardapioDocument> {
    return this.cardapiosService.removerItem(id, semana, diaSemana, refeicao, itemId);
  }
}

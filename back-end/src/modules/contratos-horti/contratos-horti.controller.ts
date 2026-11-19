import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { ContratosHortiService } from './contratos-horti.service.js';
import { CreateContratoHortiDto } from './dto/create-contrato-horti.dto.js';
import { QueryContratoHortiDto } from './dto/query-contrato-horti.dto.js';
import { RegistrarAlteracaoItemDto } from './dto/registrar-alteracao-item.dto.js';
import { UpdateContratoHortiDto } from './dto/update-contrato-horti.dto.js';
import { UpdateItensContratoDto } from './dto/update-itens-contrato.dto.js';
import type { ContratoHortiHistoricoDocument } from './schemas/contrato-horti-historico.schema.js';
import type { ContratoHortiDocument } from './schemas/contrato-horti.schema.js';

@ApiTags('Contratos de hortifruti')
@Controller('contratos-horti')
export class ContratosHortiController {
  constructor(private readonly contratosHortiService: ContratosHortiService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um contrato de compra de hortifruti' })
  create(@Body() dto: CreateContratoHortiDto): Promise<ContratoHortiDocument> {
    return this.contratosHortiService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista contratos de hortifruti por fornecedor, agricultura familiar e ativo' })
  findAll(@Query() query: QueryContratoHortiDto): Promise<ContratoHortiDocument[]> {
    return this.contratosHortiService.findAll(query);
  }

  @Get(':id/historico')
  @ApiOperation({ summary: 'Lista o histórico imutável de alterações do contrato' })
  listarHistorico(@Param('id', ParseObjectIdPipe) id: string): Promise<ContratoHortiHistoricoDocument[]> {
    return this.contratosHortiService.listarHistorico(id);
  }

  @Post(':id/itens/alteracoes')
  @ApiOperation({ summary: 'Atualiza um item do contrato e grava o evento no histórico' })
  registrarAlteracaoItem(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: RegistrarAlteracaoItemDto,
  ): Promise<ContratoHortiDocument> {
    return this.contratosHortiService.registrarAlteracaoItem(id, dto);
  }

  @Put(':id/itens')
  @ApiOperation({ summary: 'Substitui os itens do contrato diretamente, sem gerar evento no histórico' })
  updateItens(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateItensContratoDto,
  ): Promise<ContratoHortiDocument> {
    return this.contratosHortiService.updateItens(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um contrato de hortifruti pelo identificador' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<ContratoHortiDocument> {
    return this.contratosHortiService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados gerais do contrato, sem alterar itens' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateContratoHortiDto,
  ): Promise<ContratoHortiDocument> {
    return this.contratosHortiService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um contrato de hortifruti' })
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.contratosHortiService.remove(id);
  }
}

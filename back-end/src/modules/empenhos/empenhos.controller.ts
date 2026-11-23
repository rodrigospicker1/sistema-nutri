import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CreateEmpenhoDto } from './dto/create-empenho.dto.js';
import { QueryEmpenhoDto } from './dto/query-empenho.dto.js';
import { UpdateEmpenhoDto } from './dto/update-empenho.dto.js';
import { EmpenhosService } from './empenhos.service.js';
import type { EmpenhoDocument } from './schemas/empenho.schema.js';

@ApiTags('Empenhos')
@Controller('empenhos')
export class EmpenhosController {
  constructor(private readonly empenhosService: EmpenhosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um empenho vinculado a um contrato de hortifruti' })
  create(@Body() dto: CreateEmpenhoDto): Promise<EmpenhoDocument> {
    return this.empenhosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista empenhos filtrando por contrato de hortifruti e ativo' })
  findAll(@Query() query: QueryEmpenhoDto): Promise<EmpenhoDocument[]> {
    return this.empenhosService.findAll(query);
  }

  @Get('saldo-disponivel/:contratoHortiId')
  @ApiOperation({ summary: 'Quanto ainda cabe empenhar de cada alimento ativo do contrato' })
  saldoDisponivel(@Param('contratoHortiId', ParseObjectIdPipe) contratoHortiId: string) {
    return this.empenhosService.saldoDisponivel(contratoHortiId);
  }

  @Get('saldo-concorrente')
  @ApiOperation({ summary: 'Saldo por empenho em todos os contratos ativos (sem filtro de contrato)' })
  saldoConcorrenteGeral() {
    return this.empenhosService.saldoConcorrente();
  }

  @Get('saldo-concorrente/:contratoHortiId')
  @ApiOperation({ summary: 'Saldo por empenho: empenhado menos o alocado em listas de compras confirmadas' })
  saldoConcorrente(@Param('contratoHortiId', ParseObjectIdPipe) contratoHortiId: string) {
    return this.empenhosService.saldoConcorrente(contratoHortiId);
  }

  @Get('ativos-por-alimento/:alimentoId')
  @ApiOperation({ summary: 'Empenhos ativos que reservam o alimento, para o seletor do cardápio e da lista' })
  ativosPorAlimento(@Param('alimentoId', ParseObjectIdPipe) alimentoId: string) {
    return this.empenhosService.ativosPorAlimento(alimentoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um empenho pelo identificador' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<EmpenhoDocument> {
    return this.empenhosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um empenho e reaplica as validações de vigência e saldo' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateEmpenhoDto): Promise<EmpenhoDocument> {
    return this.empenhosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um empenho' })
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.empenhosService.remove(id);
  }
}

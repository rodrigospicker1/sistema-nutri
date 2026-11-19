import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CreateIncidenciaRegraDto } from './dto/create-incidencia-regra.dto.js';
import { QueryIncidenciaRegraDto } from './dto/query-incidencia-regra.dto.js';
import { UpdateIncidenciaRegraDto } from './dto/update-incidencia-regra.dto.js';
import { IncidenciasRegrasService } from './incidencias-regras.service.js';
import type { IncidenciaRegraDocument } from './schemas/incidencia-regra.schema.js';

@ApiTags('Regras de incidência')
@Controller('incidencias-regras')
export class IncidenciasRegrasController {
  constructor(private readonly regrasService: IncidenciasRegrasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma regra de frequência' })
  create(@Body() dto: CreateIncidenciaRegraDto): Promise<IncidenciaRegraDocument> {
    return this.regrasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista regras filtrando por agrupamento, contrato e período' })
  findAll(@Query() query: QueryIncidenciaRegraDto): Promise<IncidenciaRegraDocument[]> {
    return this.regrasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma regra de frequência' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<IncidenciaRegraDocument> {
    return this.regrasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma regra de frequência' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateIncidenciaRegraDto,
  ): Promise<IncidenciaRegraDocument> {
    return this.regrasService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma regra de frequência' })
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.regrasService.remove(id);
  }
}

import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CreateGrupoIncidenciaDto } from './dto/create-grupo-incidencia.dto.js';
import { QueryGrupoIncidenciaDto } from './dto/query-grupo-incidencia.dto.js';
import { UpdateGrupoIncidenciaDto } from './dto/update-grupo-incidencia.dto.js';
import { GruposIncidenciaService } from './grupos-incidencia.service.js';
import type { GrupoIncidenciaDocument } from './schemas/grupo-incidencia.schema.js';

@ApiTags('Grupos de incidência')
@Controller('grupos-incidencia')
export class GruposIncidenciaController {
  constructor(private readonly gruposIncidenciaService: GruposIncidenciaService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um grupo de incidência' })
  create(@Body() dto: CreateGrupoIncidenciaDto): Promise<GrupoIncidenciaDocument> {
    return this.gruposIncidenciaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista grupos de incidência filtrando por nome, origemRegra e ativo' })
  findAll(@Query() query: QueryGrupoIncidenciaDto): Promise<GrupoIncidenciaDocument[]> {
    return this.gruposIncidenciaService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um grupo de incidência pelo identificador' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<GrupoIncidenciaDocument> {
    return this.gruposIncidenciaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um grupo de incidência' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateGrupoIncidenciaDto,
  ): Promise<GrupoIncidenciaDocument> {
    return this.gruposIncidenciaService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um grupo de incidência' })
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.gruposIncidenciaService.remove(id);
  }
}

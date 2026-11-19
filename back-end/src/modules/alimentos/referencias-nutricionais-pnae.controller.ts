import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CreateReferenciaNutricionalPnaeDto } from './dto/create-referencia-nutricional-pnae.dto.js';
import { QueryReferenciaNutricionalPnaeDto } from './dto/query-referencia-nutricional-pnae.dto.js';
import { UpdateReferenciaNutricionalPnaeDto } from './dto/update-referencia-nutricional-pnae.dto.js';
import { ReferenciasNutricionaisPnaeService } from './referencias-nutricionais-pnae.service.js';
import type { ReferenciaNutricionalPnaeDocument } from './schemas/referencia-nutricional-pnae.schema.js';

@ApiTags('Referências nutricionais PNAE')
@Controller('referencias-nutricionais-pnae')
export class ReferenciasNutricionaisPnaeController {
  constructor(private readonly referenciasService: ReferenciasNutricionaisPnaeService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma referência nutricional do PNAE' })
  create(@Body() dto: CreateReferenciaNutricionalPnaeDto): Promise<ReferenciaNutricionalPnaeDocument> {
    return this.referenciasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista referências nutricionais do PNAE filtrando por ativo' })
  findAll(@Query() query: QueryReferenciaNutricionalPnaeDto): Promise<ReferenciaNutricionalPnaeDocument[]> {
    return this.referenciasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma referência nutricional do PNAE pelo identificador' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<ReferenciaNutricionalPnaeDocument> {
    return this.referenciasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma referência nutricional do PNAE' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateReferenciaNutricionalPnaeDto,
  ): Promise<ReferenciaNutricionalPnaeDocument> {
    return this.referenciasService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma referência nutricional do PNAE' })
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.referenciasService.remove(id);
  }
}

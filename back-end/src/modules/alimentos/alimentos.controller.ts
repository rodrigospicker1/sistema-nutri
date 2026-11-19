import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { AlimentosService } from './alimentos.service.js';
import { CreateAlimentoDto } from './dto/create-alimento.dto.js';
import { QueryAlimentoDto } from './dto/query-alimento.dto.js';
import { UpdateAlimentoDto } from './dto/update-alimento.dto.js';
import type { AlimentoDocument } from './schemas/alimento.schema.js';

@ApiTags('Alimentos')
@Controller('alimentos')
export class AlimentosController {
  constructor(private readonly alimentosService: AlimentosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um alimento' })
  create(@Body() dto: CreateAlimentoDto): Promise<AlimentoDocument> {
    return this.alimentosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista alimentos filtrando por nome, categoria e ativo' })
  findAll(@Query() query: QueryAlimentoDto): Promise<AlimentoDocument[]> {
    return this.alimentosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um alimento pelo identificador' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<AlimentoDocument> {
    return this.alimentosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um alimento' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateAlimentoDto,
  ): Promise<AlimentoDocument> {
    return this.alimentosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um alimento' })
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.alimentosService.remove(id);
  }
}

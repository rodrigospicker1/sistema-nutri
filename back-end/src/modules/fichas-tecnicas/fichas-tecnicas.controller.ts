import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { CreateFichaTecnicaDto } from './dto/create-ficha-tecnica.dto.js';
import { UpdateFichaTecnicaDto } from './dto/update-ficha-tecnica.dto.js';
import { FichasTecnicasService } from './fichas-tecnicas.service.js';
import type { FichaTecnicaDocument } from './schemas/ficha-tecnica.schema.js';

@ApiTags('Fichas técnicas')
@Controller('fichas-tecnicas')
export class FichasTecnicasController {
  constructor(private readonly fichasService: FichasTecnicasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma ficha técnica' })
  create(@Body() dto: CreateFichaTecnicaDto): Promise<FichaTecnicaDocument> {
    return this.fichasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista fichas técnicas' })
  findAll(): Promise<FichaTecnicaDocument[]> {
    return this.fichasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca ficha técnica pelo identificador' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<FichaTecnicaDocument> {
    return this.fichasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza a ficha técnica' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateFichaTecnicaDto,
  ): Promise<FichaTecnicaDocument> {
    return this.fichasService.update(id, dto);
  }
}

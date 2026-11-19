import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGrupoIncidenciaDto } from './dto/create-grupo-incidencia.dto.js';
import { QueryGrupoIncidenciaDto } from './dto/query-grupo-incidencia.dto.js';
import { UpdateGrupoIncidenciaDto } from './dto/update-grupo-incidencia.dto.js';
import { GrupoIncidencia, type GrupoIncidenciaDocument } from './schemas/grupo-incidencia.schema.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class GruposIncidenciaService {
  constructor(
    @InjectModel(GrupoIncidencia.name) private readonly grupoIncidenciaModel: Model<GrupoIncidencia>,
  ) {}

  async create(dto: CreateGrupoIncidenciaDto): Promise<GrupoIncidenciaDocument> {
    return this.grupoIncidenciaModel.create(dto);
  }

  async findAll(query: QueryGrupoIncidenciaDto): Promise<GrupoIncidenciaDocument[]> {
    const filter: {
      nome?: { $regex: string; $options: string };
      origemRegra?: QueryGrupoIncidenciaDto['origemRegra'];
      ativo?: boolean;
    } = {};
    if (query.origemRegra) filter.origemRegra = query.origemRegra;
    const nome = query.nome?.trim();
    if (nome) {
      filter.nome = { $regex: escapeRegex(nome), $options: 'i' };
    }
    if (query.ativo !== undefined) {
      filter.ativo = query.ativo;
    }
    return this.grupoIncidenciaModel.find(filter).sort({ nome: 1 }).exec();
  }

  async findOne(id: string): Promise<GrupoIncidenciaDocument> {
    const grupo = await this.grupoIncidenciaModel.findById(id).exec();
    if (!grupo) {
      throw new NotFoundException('Grupo de incidência não encontrado');
    }
    return grupo;
  }

  async update(id: string, dto: UpdateGrupoIncidenciaDto): Promise<GrupoIncidenciaDocument> {
    const grupo = await this.grupoIncidenciaModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!grupo) {
      throw new NotFoundException('Grupo de incidência não encontrado');
    }
    return grupo;
  }

  async remove(id: string): Promise<void> {
    const grupo = await this.grupoIncidenciaModel.findByIdAndDelete(id).exec();
    if (!grupo) {
      throw new NotFoundException('Grupo de incidência não encontrado');
    }
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriaAlimento } from '../../common/enums/index.js';
import { CreateAlimentoDto } from './dto/create-alimento.dto.js';
import { QueryAlimentoDto } from './dto/query-alimento.dto.js';
import { UpdateAlimentoDto } from './dto/update-alimento.dto.js';
import { Alimento, type AlimentoDocument } from './schemas/alimento.schema.js';
import { GrupoIncidencia } from './schemas/grupo-incidencia.schema.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class AlimentosService {
  constructor(
    @InjectModel(Alimento.name) private readonly alimentoModel: Model<Alimento>,
    @InjectModel(GrupoIncidencia.name) private readonly grupoIncidenciaModel: Model<GrupoIncidencia>,
  ) {}

  async create(dto: CreateAlimentoDto): Promise<AlimentoDocument> {
    await this.assertGruposExistem(dto.gruposIncidenciaIds);
    return this.alimentoModel.create(dto);
  }

  async findAll(query: QueryAlimentoDto): Promise<AlimentoDocument[]> {
    const filter: {
      nome?: { $regex: string; $options: string };
      categoria?: CategoriaAlimento;
      ativo?: boolean;
    } = {};
    const nome = query.nome?.trim();
    if (nome) {
      filter.nome = { $regex: escapeRegex(nome), $options: 'i' };
    }
    if (query.categoria) {
      filter.categoria = query.categoria;
    }
    if (query.ativo !== undefined) {
      filter.ativo = query.ativo;
    }
    return this.alimentoModel.find(filter).sort({ nome: 1 }).exec();
  }

  async findOne(id: string): Promise<AlimentoDocument> {
    const alimento = await this.alimentoModel.findById(id).exec();
    if (!alimento) {
      throw new NotFoundException('Alimento não encontrado');
    }
    return alimento;
  }

  async update(id: string, dto: UpdateAlimentoDto): Promise<AlimentoDocument> {
    await this.assertGruposExistem(dto.gruposIncidenciaIds);
    const alimento = await this.alimentoModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!alimento) {
      throw new NotFoundException('Alimento não encontrado');
    }
    return alimento;
  }

  async remove(id: string): Promise<void> {
    const alimento = await this.alimentoModel.findByIdAndDelete(id).exec();
    if (!alimento) {
      throw new NotFoundException('Alimento não encontrado');
    }
  }

  private async assertGruposExistem(ids: string[] | undefined): Promise<void> {
    if (!ids?.length) {
      return;
    }
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('gruposIncidenciaIds contém identificadores duplicados');
    }
    const encontrados = await this.grupoIncidenciaModel.countDocuments({ _id: { $in: ids } }).exec();
    if (encontrados !== ids.length) {
      throw new BadRequestException('Um ou mais grupos de incidência não existem');
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TipoAlvoIncidencia } from '../../common/enums/index.js';
import { Alimento, type AlimentoDocument } from '../alimentos/schemas/alimento.schema.js';
import { GrupoIncidencia, type GrupoIncidenciaDocument } from '../alimentos/schemas/grupo-incidencia.schema.js';
import { FichaTecnica, type FichaTecnicaDocument } from '../fichas-tecnicas/schemas/ficha-tecnica.schema.js';
import { assertAlvoRegraIncidencia } from './dto/alvo-regra.validator.js';
import { CreateIncidenciaRegraDto } from './dto/create-incidencia-regra.dto.js';
import { QueryIncidenciaRegraDto } from './dto/query-incidencia-regra.dto.js';
import { UpdateIncidenciaRegraDto } from './dto/update-incidencia-regra.dto.js';
import { IncidenciaRegra, type IncidenciaRegraDocument } from './schemas/incidencia-regra.schema.js';

@Injectable()
export class IncidenciasRegrasService {
  constructor(
    @InjectModel(IncidenciaRegra.name) private readonly regraModel: Model<IncidenciaRegra>,
    @InjectModel(GrupoIncidencia.name) private readonly grupoModel: Model<GrupoIncidencia>,
    @InjectModel(Alimento.name) private readonly alimentoModel: Model<Alimento>,
    @InjectModel(FichaTecnica.name) private readonly fichaModel: Model<FichaTecnica>,
  ) {}

  async create(dto: CreateIncidenciaRegraDto): Promise<IncidenciaRegraDocument> {
    assertAlvoRegraIncidencia(dto.tipoAlvo, dto.grupoIncidenciaId, dto.fichaTecnicaId, dto.alimentoId);
    await this.garantirAlvo(dto.tipoAlvo, dto.grupoIncidenciaId, dto.fichaTecnicaId, dto.alimentoId);
    return this.regraModel.create(this.payload(dto));
  }

  async findAll(query: QueryIncidenciaRegraDto): Promise<IncidenciaRegraDocument[]> {
    const filter: {
      agrupamentoCardapioId?: Types.ObjectId;
      contratoTerceirizadaId?: string;
      periodo?: QueryIncidenciaRegraDto['periodo'];
    } = {};
    if (query.agrupamentoCardapioId) filter.agrupamentoCardapioId = new Types.ObjectId(query.agrupamentoCardapioId);
    if (query.contratoTerceirizadaId) filter.contratoTerceirizadaId = query.contratoTerceirizadaId;
    if (query.periodo) filter.periodo = query.periodo;
    return this.regraModel.find(filter).exec();
  }

  async findOne(id: string): Promise<IncidenciaRegraDocument> {
    const regra = await this.regraModel.findById(id).exec();
    if (!regra) throw new NotFoundException('Regra de incidência não encontrada');
    return regra;
  }

  async update(id: string, dto: UpdateIncidenciaRegraDto): Promise<IncidenciaRegraDocument> {
    const atual = await this.findOne(id);
    const tipoAlvo = dto.tipoAlvo ?? atual.tipoAlvo;
    const grupo = dto.grupoIncidenciaId !== undefined ? dto.grupoIncidenciaId : atual.grupoIncidenciaId?.toString() ?? null;
    const ficha = dto.fichaTecnicaId !== undefined ? dto.fichaTecnicaId : atual.fichaTecnicaId?.toString() ?? null;
    const alimento = dto.alimentoId !== undefined ? dto.alimentoId : atual.alimentoId?.toString() ?? null;
    assertAlvoRegraIncidencia(tipoAlvo, grupo, ficha, alimento);
    await this.garantirAlvo(tipoAlvo, grupo, ficha, alimento);
    const regra = await this.regraModel
      .findByIdAndUpdate(id, this.payload(dto), { new: true, runValidators: true })
      .exec();
    if (!regra) throw new NotFoundException('Regra de incidência não encontrada');
    return regra;
  }

  async remove(id: string): Promise<void> {
    const regra = await this.regraModel.findByIdAndDelete(id).exec();
    if (!regra) throw new NotFoundException('Regra de incidência não encontrada');
  }

  private async garantirAlvo(
    tipoAlvo: TipoAlvoIncidencia,
    grupoIncidenciaId?: string | null,
    fichaTecnicaId?: string | null,
    alimentoId?: string | null,
  ): Promise<void> {
    if (tipoAlvo === 'GRUPO' && grupoIncidenciaId) {
      const grupo: GrupoIncidenciaDocument | null = await this.grupoModel.findById(grupoIncidenciaId).exec();
      if (!grupo) throw new NotFoundException('Grupo de incidência não encontrado');
    }
    if (tipoAlvo === 'FICHA_TECNICA' && fichaTecnicaId) {
      const ficha: FichaTecnicaDocument | null = await this.fichaModel.findById(fichaTecnicaId).exec();
      if (!ficha) throw new NotFoundException('Ficha técnica não encontrada');
    }
    if (tipoAlvo === 'ALIMENTO' && alimentoId) {
      const alimento: AlimentoDocument | null = await this.alimentoModel.findById(alimentoId).exec();
      if (!alimento) throw new NotFoundException('Alimento não encontrado');
    }
  }

  private payload(dto: CreateIncidenciaRegraDto | UpdateIncidenciaRegraDto): Record<string, unknown> {
    const dados: Record<string, unknown> = {};
    if (dto.tipoAlvo !== undefined) dados.tipoAlvo = dto.tipoAlvo;
    if (dto.periodo !== undefined) dados.periodo = dto.periodo;
    if (dto.frequenciaMinima !== undefined) dados.frequenciaMinima = dto.frequenciaMinima;
    if (dto.frequenciaMaxima !== undefined) dados.frequenciaMaxima = dto.frequenciaMaxima;
    if (dto.ativo !== undefined) dados.ativo = dto.ativo;
    if (dto.contratoTerceirizadaId !== undefined) {
      dados.contratoTerceirizadaId = dto.contratoTerceirizadaId;
    }
    this.copiarId(dados, 'grupoIncidenciaId', dto.grupoIncidenciaId);
    this.copiarId(dados, 'fichaTecnicaId', dto.fichaTecnicaId);
    this.copiarId(dados, 'alimentoId', dto.alimentoId);
    this.copiarId(dados, 'agrupamentoCardapioId', dto.agrupamentoCardapioId);
    return dados;
  }

  private copiarId(dados: Record<string, unknown>, campo: string, valor: string | null | undefined): void {
    if (valor === undefined) return;
    dados[campo] = valor === null ? null : new Types.ObjectId(valor);
  }
}
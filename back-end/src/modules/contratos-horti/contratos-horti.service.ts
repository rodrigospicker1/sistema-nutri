import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TipoEventoContrato, type UnidadeMedida } from '../../common/enums/index.js';
import { Alimento } from '../alimentos/schemas/alimento.schema.js';
import { CreateContratoHortiDto } from './dto/create-contrato-horti.dto.js';
import { ItemContratoHortiDto } from './dto/item-contrato-horti.dto.js';
import { QueryContratoHortiDto } from './dto/query-contrato-horti.dto.js';
import { RegistrarAlteracaoItemDto } from './dto/registrar-alteracao-item.dto.js';
import { UpdateContratoHortiDto } from './dto/update-contrato-horti.dto.js';
import { UpdateItensContratoDto } from './dto/update-itens-contrato.dto.js';
import { ContratoHortiHistorico, type ContratoHortiHistoricoDocument } from './schemas/contrato-horti-historico.schema.js';
import { ContratoHorti, type ContratoHortiDocument } from './schemas/contrato-horti.schema.js';
import type { ItemContratoHorti } from './schemas/item-contrato-horti.schema.js';

interface ValoresHistoricoItem {
  unidadeMedida?: UnidadeMedida;
  valorAnterior?: number;
  valorNovo?: number;
  qtdAnterior?: number;
  qtdNova?: number;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function duplicado(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

@Injectable()
export class ContratosHortiService {
  constructor(
    @InjectModel(ContratoHorti.name) private readonly contratoModel: Model<ContratoHorti>,
    @InjectModel(ContratoHortiHistorico.name) private readonly historicoModel: Model<ContratoHortiHistorico>,
    @InjectModel(Alimento.name) private readonly alimentoModel: Model<Alimento>,
  ) {}

  async create(dto: CreateContratoHortiDto): Promise<ContratoHortiDocument> {
    this.assertVigencia(dto.vigenciaInicio, dto.vigenciaFim);
    this.assertItens(dto.itens ?? []);
    await this.assertAlimentosExistem((dto.itens ?? []).map((item) => item.alimentoId));
    try {
      return await this.contratoModel.create(dto);
    } catch (error) {
      if (duplicado(error)) {
        throw new BadRequestException('Já existe contrato de hortifruti com este número');
      }
      throw error;
    }
  }

  async findAll(query: QueryContratoHortiDto): Promise<ContratoHortiDocument[]> {
    const filter: {
      fornecedorNome?: { $regex: string; $options: string };
      ativo?: boolean;
      agriculturaFamiliar?: boolean;
    } = {};
    const fornecedorNome = query.fornecedorNome?.trim();
    if (fornecedorNome) {
      filter.fornecedorNome = { $regex: escapeRegex(fornecedorNome), $options: 'i' };
    }
    if (query.ativo !== undefined) {
      filter.ativo = query.ativo;
    }
    if (query.agriculturaFamiliar !== undefined) {
      filter.agriculturaFamiliar = query.agriculturaFamiliar;
    }
    return this.contratoModel.find(filter).sort({ numeroContrato: 1 }).exec();
  }

  async findOne(id: string): Promise<ContratoHortiDocument> {
    const contrato = await this.contratoModel.findById(id).exec();
    if (!contrato) {
      throw new NotFoundException('Contrato de hortifruti não encontrado');
    }
    return contrato;
  }

  async update(id: string, dto: UpdateContratoHortiDto): Promise<ContratoHortiDocument> {
    const atual = await this.findOne(id);
    const inicio = dto.vigenciaInicio ?? atual.vigenciaInicio;
    const fim = dto.vigenciaFim ?? atual.vigenciaFim;
    this.assertVigencia(inicio, fim);
    try {
      const contrato = await this.contratoModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).exec();
      if (!contrato) {
        throw new NotFoundException('Contrato de hortifruti não encontrado');
      }
      return contrato;
    } catch (error) {
      if (duplicado(error)) {
        throw new BadRequestException('Já existe contrato de hortifruti com este número');
      }
      throw error;
    }
  }

  async updateItens(contratoHortiId: string, dto: UpdateItensContratoDto): Promise<ContratoHortiDocument> {
    const contrato = await this.findOne(contratoHortiId);
    this.assertItens(dto.itens);
    await this.assertAlimentosExistem(dto.itens.map((item) => item.alimentoId));
    contrato.itens = dto.itens.map((item) => ({
      alimentoId: new Types.ObjectId(item.alimentoId),
      unidadeMedida: item.unidadeMedida,
      qtdTotalLicitada: item.qtdTotalLicitada,
      valorUnitario: item.valorUnitario,
      perCapita: item.perCapita ?? null,
      fatorCorrecao: item.fatorCorrecao ?? null,
      gramasPorUnidade: item.gramasPorUnidade ?? null,
      diasSemanaEntrega: item.diasSemanaEntrega,
      ativo: item.ativo ?? true,
    }));
    return contrato.save();
  }

  async remove(id: string): Promise<void> {
    const contrato = await this.contratoModel.findByIdAndDelete(id).exec();
    if (!contrato) {
      throw new NotFoundException('Contrato de hortifruti não encontrado');
    }
  }

  async listarHistorico(contratoHortiId: string): Promise<ContratoHortiHistoricoDocument[]> {
    await this.findOne(contratoHortiId);
    return this.historicoModel.find({ contratoHortiId: new Types.ObjectId(contratoHortiId) }).sort({ createdAt: -1 }).exec();
  }

  async registrarAlteracaoItem(contratoHortiId: string, dto: RegistrarAlteracaoItemDto): Promise<ContratoHortiDocument> {
    const contrato = await this.findOne(contratoHortiId);
    if (dto.tipoEvento === TipoEventoContrato.INCLUSAO_ALIMENTO) {
      await this.assertAlimentosExistem([dto.alimentoId]);
    }
    const valores = this.aplicarAlteracaoItem(contrato, dto);
    await contrato.save();
    await this.historicoModel.create({
      contratoHortiId: contrato._id,
      tipoEvento: dto.tipoEvento,
      numeroDocumento: dto.numeroDocumento,
      dataVigencia: dto.dataVigencia,
      alimentoId: dto.alimentoId,
      motivo: dto.motivo,
      autorUsuarioId: dto.autorUsuarioId,
      ...valores,
    });
    return contrato;
  }

  private aplicarAlteracaoItem(contrato: ContratoHortiDocument, dto: RegistrarAlteracaoItemDto): ValoresHistoricoItem {
    switch (dto.tipoEvento) {
      case TipoEventoContrato.REAJUSTE_PRECO:
        return this.reajustarPreco(contrato, dto);
      case TipoEventoContrato.ACRESCIMO_QUANTIDADE:
        return this.acrescerQuantidade(contrato, dto);
      case TipoEventoContrato.INCLUSAO_ALIMENTO:
        return this.incluirAlimento(contrato, dto);
      case TipoEventoContrato.INATIVACAO_ALIMENTO:
        return this.inativarAlimento(contrato, dto);
      default:
        throw new BadRequestException('Evento não altera item do contrato');
    }
  }

  private reajustarPreco(contrato: ContratoHortiDocument, dto: RegistrarAlteracaoItemDto): ValoresHistoricoItem {
    if (dto.valorNovo === undefined) {
      throw new BadRequestException('valorNovo é obrigatório no reajuste de preço');
    }
    const item = this.buscarItemAtivo(contrato, dto.alimentoId);
    if (dto.valorNovo === item.valorUnitario) {
      throw new BadRequestException('valorNovo deve ser diferente do valor atual');
    }
    const valorAnterior = item.valorUnitario;
    item.valorUnitario = dto.valorNovo;
    return { unidadeMedida: item.unidadeMedida, valorAnterior, valorNovo: dto.valorNovo };
  }

  private acrescerQuantidade(contrato: ContratoHortiDocument, dto: RegistrarAlteracaoItemDto): ValoresHistoricoItem {
    if (dto.qtdNova === undefined) {
      throw new BadRequestException('qtdNova é obrigatória no acréscimo de quantidade');
    }
    const item = this.buscarItemAtivo(contrato, dto.alimentoId);
    if (dto.qtdNova <= item.qtdTotalLicitada) {
      throw new BadRequestException('qtdNova deve ser maior que a quantidade total licitada atual');
    }
    const qtdAnterior = item.qtdTotalLicitada;
    item.qtdTotalLicitada = dto.qtdNova;
    return { unidadeMedida: item.unidadeMedida, qtdAnterior, qtdNova: dto.qtdNova };
  }

  private incluirAlimento(contrato: ContratoHortiDocument, dto: RegistrarAlteracaoItemDto): ValoresHistoricoItem {
    if (
      dto.unidadeMedida === undefined ||
      dto.valorNovo === undefined ||
      dto.qtdNova === undefined ||
      !dto.diasSemanaEntrega?.length
    ) {
      throw new BadRequestException('Inclusão exige unidadeMedida, valorNovo, qtdNova e diasSemanaEntrega');
    }
    this.assertDiasUnicos(dto.diasSemanaEntrega);
    const existente = this.buscarItem(contrato, dto.alimentoId);
    if (existente?.ativo) {
      throw new BadRequestException('Alimento já está ativo no contrato');
    }
    const valores: ValoresHistoricoItem = {
      unidadeMedida: dto.unidadeMedida,
      valorNovo: dto.valorNovo,
      qtdNova: dto.qtdNova,
    };
    if (existente) {
      valores.valorAnterior = existente.valorUnitario;
      valores.qtdAnterior = existente.qtdTotalLicitada;
      existente.ativo = true;
      existente.unidadeMedida = dto.unidadeMedida;
      existente.valorUnitario = dto.valorNovo;
      existente.qtdTotalLicitada = dto.qtdNova;
      existente.perCapita = dto.perCapita ?? null;
      existente.fatorCorrecao = dto.fatorCorrecao ?? null;
      existente.gramasPorUnidade = dto.gramasPorUnidade ?? null;
      existente.diasSemanaEntrega = dto.diasSemanaEntrega;
      return valores;
    }
    contrato.itens.push({
      alimentoId: new Types.ObjectId(dto.alimentoId),
      unidadeMedida: dto.unidadeMedida,
      qtdTotalLicitada: dto.qtdNova,
      valorUnitario: dto.valorNovo,
      perCapita: dto.perCapita ?? null,
      fatorCorrecao: dto.fatorCorrecao ?? null,
      gramasPorUnidade: dto.gramasPorUnidade ?? null,
      diasSemanaEntrega: dto.diasSemanaEntrega,
      ativo: true,
    });
    return valores;
  }

  private inativarAlimento(contrato: ContratoHortiDocument, dto: RegistrarAlteracaoItemDto): ValoresHistoricoItem {
    const item = this.buscarItemAtivo(contrato, dto.alimentoId);
    item.ativo = false;
    return {
      unidadeMedida: item.unidadeMedida,
      valorAnterior: item.valorUnitario,
      qtdAnterior: item.qtdTotalLicitada,
    };
  }

  private assertVigencia(inicio: Date, fim: Date): void {
    if (fim.getTime() < inicio.getTime()) {
      throw new BadRequestException('vigenciaFim não pode ser anterior a vigenciaInicio');
    }
  }

  private assertItens(itens: ItemContratoHortiDto[]): void {
    this.assertAlimentosUnicos(itens.map((item) => item.alimentoId));
    for (const item of itens) {
      this.assertDiasUnicos(item.diasSemanaEntrega);
    }
  }

  private assertAlimentosUnicos(ids: string[]): void {
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('itens contém alimento duplicado');
    }
  }

  private assertDiasUnicos(dias: number[]): void {
    if (new Set(dias).size !== dias.length) {
      throw new BadRequestException('diasSemanaEntrega não pode repetir o dia');
    }
  }

  private async assertAlimentosExistem(ids: string[]): Promise<void> {
    const unicos = [...new Set(ids)];
    if (unicos.length === 0) {
      return;
    }
    const encontrados = await this.alimentoModel.countDocuments({ _id: { $in: unicos } }).exec();
    if (encontrados !== unicos.length) {
      throw new BadRequestException('Um ou mais alimentos não existem');
    }
  }

  private buscarItem(contrato: ContratoHortiDocument, alimentoId: string): ItemContratoHorti | undefined {
    return contrato.itens.find((item) => item.alimentoId.toString() === alimentoId);
  }

  private buscarItemAtivo(contrato: ContratoHortiDocument, alimentoId: string): ItemContratoHorti {
    const item = contrato.itens.find((atual) => atual.alimentoId.toString() === alimentoId && atual.ativo);
    if (!item) {
      throw new BadRequestException('Alimento não encontrado entre os itens ativos do contrato');
    }
    return item;
  }
}

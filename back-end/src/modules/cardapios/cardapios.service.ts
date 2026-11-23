import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StatusCardapio, TipoCardapio, TipoDiaCardapio } from '../../common/enums/index.js';
import { AgrupamentosCardapioService } from './agrupamentos-cardapio.service.js';
import { ContratoHorti } from '../contratos-horti/schemas/contrato-horti.schema.js';
import { ClonarCardapioDto } from './dto/clonar-cardapio.dto.js';
import { CreateCardapioDto } from './dto/create-cardapio.dto.js';
import { DefinirTipoDiaDto } from './dto/definir-tipo-dia.dto.js';
import { ItemCardapioDto } from './dto/item-cardapio.dto.js';
import { UpdateCardapioDto } from './dto/update-cardapio.dto.js';
import { Cardapio, type CardapioDocument, type DiaCardapio, type ItemCardapio } from './schemas/cardapio.schema.js';

function novoIdItem(): string {
  return `item-${Math.random().toString(36).slice(2, 10)}`;
}

function montarGrade(semanas: number, refeicoes: string[]): DiaCardapio[] {
  const dias: DiaCardapio[] = [];
  for (let numeroSemana = 1; numeroSemana <= semanas; numeroSemana += 1) {
    for (let diaSemana = 1; diaSemana <= 5; diaSemana += 1) {
      dias.push({
        numeroSemana,
        diaSemana,
        tipoDia: TipoDiaCardapio.LETIVO,
        refeicoes: refeicoes.map((refeicao) => ({ refeicao, itens: [] })),
      });
    }
  }
  return dias;
}

function dataDoDia(mes: number, ano: number, numeroSemana: number, diaSemana: number): Date {
  const primeiro = new Date(Date.UTC(ano, mes - 1, 1));
  const segundaDaSemana1 = new Date(primeiro);
  segundaDaSemana1.setUTCDate(primeiro.getUTCDate() - ((primeiro.getUTCDay() + 6) % 7));
  const sextaDaSemana1 = new Date(segundaDaSemana1);
  sextaDaSemana1.setUTCDate(segundaDaSemana1.getUTCDate() + 4);
  while (sextaDaSemana1 < primeiro) {
    segundaDaSemana1.setUTCDate(segundaDaSemana1.getUTCDate() + 7);
    sextaDaSemana1.setUTCDate(sextaDaSemana1.getUTCDate() + 7);
  }
  const data = new Date(segundaDaSemana1);
  data.setUTCDate(segundaDaSemana1.getUTCDate() + (numeroSemana - 1) * 7 + (diaSemana - 1));
  return data;
}

export function comDatasReais(dias: DiaCardapio[], mes?: number, ano?: number): DiaCardapio[] {
  if (!mes || !ano) return dias;
  return dias.map((dia) => ({ ...dia, data: dataDoDia(mes, ano, dia.numeroSemana, dia.diaSemana) }));
}

@Injectable()
export class CardapiosService {
  constructor(
    @InjectModel(Cardapio.name) private readonly cardapioModel: Model<Cardapio>,
    @InjectModel(ContratoHorti.name) private readonly contratoModel: Model<ContratoHorti>,
    private readonly agrupamentosService: AgrupamentosCardapioService,
  ) {}

  findAll(): Promise<CardapioDocument[]> {
    return this.cardapioModel.find().sort({ nome: 1 }).exec();
  }

  async findOne(id: string): Promise<CardapioDocument> {
    const cardapio = await this.cardapioModel.findById(id).exec();
    if (!cardapio) throw new NotFoundException('Cardápio não encontrado');
    return cardapio;
  }

  async create(dto: CreateCardapioDto): Promise<CardapioDocument> {
    const agrupamento = await this.agrupamentosService.findOne(dto.agrupamentoCardapioId);
    const tipo: TipoCardapio = dto.tipo === 'MENSAL' ? TipoCardapio.MENSAL : TipoCardapio.MODELO;
    const semanas = dto.quantidadeSemanas ?? 5;
    const refeicoes = dto.refeicoes?.length ? dto.refeicoes : [];
    return this.cardapioModel.create({
      nome: dto.nome.trim(),
      tipo,
      status: tipo === TipoCardapio.MENSAL ? StatusCardapio.NOVO : StatusCardapio.ATIVO,
      erudioEtapaId: agrupamento.erudioEtapaIds[0] ?? 0,
      agrupamentoCardapioId: new Types.ObjectId(dto.agrupamentoCardapioId),
      refeicoes,
      observacoesCozinha: dto.observacoesCozinha,
      nutricionistasResponsaveisIds: dto.nutricionistasResponsaveisIds ?? [],
      mes: dto.mes,
      ano: dto.ano,
      dias: comDatasReais(montarGrade(semanas, refeicoes), dto.mes, dto.ano),
    });
  }

  async update(id: string, dto: UpdateCardapioDto): Promise<CardapioDocument> {
    const dados: Record<string, unknown> = {};
    if (dto.nome !== undefined) dados.nome = dto.nome;
    if (dto.status !== undefined) dados.status = dto.status;
    if (dto.observacoesCozinha !== undefined) dados.observacoesCozinha = dto.observacoesCozinha;
    if (dto.refeicoes !== undefined) dados.refeicoes = dto.refeicoes;
    if (dto.nutricionistasResponsaveisIds !== undefined) dados.nutricionistasResponsaveisIds = dto.nutricionistasResponsaveisIds;
    if (dto.mes !== undefined) dados.mes = dto.mes;
    if (dto.ano !== undefined) dados.ano = dto.ano;
    const cardapio = await this.cardapioModel.findByIdAndUpdate(id, dados, { new: true, runValidators: true }).exec();
    if (!cardapio) throw new NotFoundException('Cardápio não encontrado');
    return cardapio;
  }

  async definirTipoDia(id: string, dto: DefinirTipoDiaDto): Promise<CardapioDocument> {
    const cardapio = await this.findOne(id);
    const dia = this.localizarDia(cardapio, dto.numeroSemana, dto.diaSemana);
    dia.tipoDia = dto.tipoDia;
    return cardapio.save();
  }

  async adicionarItem(id: string, numeroSemana: number, diaSemana: number, refeicaoId: string, dto: ItemCardapioDto): Promise<CardapioDocument> {
    const cardapio = await this.findOne(id);
    if (dto.origem === 'ALIMENTO' && dto.alimentoId) {
      await this.assertAlimentoEmContrato(dto.alimentoId);
    }
    const dia = this.localizarDia(cardapio, numeroSemana, diaSemana);
    const bloco = dia.refeicoes.find((refeicao) => refeicao.refeicao === refeicaoId);
    if (!bloco) throw new BadRequestException('Refeição não encontrada neste dia');
    const item: ItemCardapio = {
      id: dto.id ?? novoIdItem(),
      origem: dto.origem,
      operador: bloco.itens.length === 0 ? null : (dto.operador ?? null),
      ativoParaCompra: dto.ativoParaCompra ?? true,
      fichaTecnicaId: dto.fichaTecnicaId,
      alimentoId: dto.alimentoId,
      perCapitaLiquido: dto.perCapitaLiquido,
      perCapitaBruto: dto.perCapitaBruto,
      porcaoServidaGramas: dto.porcaoServidaGramas,
      empenhoId: dto.empenhoId,
      empenhosIngredientes: dto.empenhosIngredientes ?? [],
    };
    bloco.itens.push(item);
    return cardapio.save();
  }

  async removerItem(id: string, numeroSemana: number, diaSemana: number, refeicaoId: string, itemId: string): Promise<CardapioDocument> {
    const cardapio = await this.findOne(id);
    const dia = this.localizarDia(cardapio, numeroSemana, diaSemana);
    const bloco = dia.refeicoes.find((refeicao) => refeicao.refeicao === refeicaoId);
    if (!bloco) throw new BadRequestException('Refeição não encontrada neste dia');
    bloco.itens = bloco.itens.filter((item) => item.id !== itemId);
    const primeiro = bloco.itens[0];
    if (primeiro) primeiro.operador = null;
    return cardapio.save();
  }

  async clonar(id: string, dto: ClonarCardapioDto): Promise<CardapioDocument> {
    const modelo = await this.findOne(id);
    if (modelo.tipo !== TipoCardapio.MODELO) {
      throw new BadRequestException('Só é possível clonar cardápios do tipo MODELO');
    }
    const copia = modelo.toObject();
    delete (copia as { _id?: unknown })._id;
    const nomeBase = modelo.nome.replace('— Modelo semanal', '').trim();
    return this.cardapioModel.create({
      ...copia,
      nome: `${nomeBase} — ${dto.mes}/${dto.ano}`,
      tipo: TipoCardapio.MENSAL,
      status: StatusCardapio.NOVO,
      mes: dto.mes,
      ano: dto.ano,
      dias: comDatasReais(copia.dias as DiaCardapio[], dto.mes, dto.ano),
    });
  }

  private async assertAlimentoEmContrato(alimentoId: string): Promise<void> {
    const contrato = await this.contratoModel
      .findOne({ ativo: true, itens: { $elemMatch: { alimentoId: new Types.ObjectId(alimentoId), ativo: true } } })
      .select('_id')
      .exec();
    if (!contrato) {
      throw new BadRequestException('Alimento não está ativo em nenhum contrato de hortifruti');
    }
  }

  private localizarDia(cardapio: CardapioDocument, numeroSemana: number, diaSemana: number): DiaCardapio {
    const dia = cardapio.dias.find((atual) => atual.numeroSemana === numeroSemana && atual.diaSemana === diaSemana);
    if (!dia) throw new NotFoundException('Dia não encontrado neste cardápio');
    return dia;
  }
}

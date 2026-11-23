import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContratoHorti, type ContratoHortiDocument } from '../contratos-horti/schemas/contrato-horti.schema.js';
import { ListaCompras, STATUS_LISTA_COMPRAS_QUE_ABATEM_SALDO } from '../listas-compras/schemas/lista-compras.schema.js';
import { CreateEmpenhoDto } from './dto/create-empenho.dto.js';
import { ItemEmpenhoDto } from './dto/item-empenho.dto.js';
import { QueryEmpenhoDto } from './dto/query-empenho.dto.js';
import { UpdateEmpenhoDto } from './dto/update-empenho.dto.js';
import { Empenho, type EmpenhoDocument } from './schemas/empenho.schema.js';

interface PeriodoEmpenho {
  contratoHortiId: string;
  dataInicio: Date;
  dataFim: Date;
  itensEmpenhados: ItemEmpenhoDto[];
  ativo: boolean;
}

function duplicado(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

function ultrapassa(soma: number, limite: number): boolean {
  return Number(soma.toFixed(4)) > Number(limite.toFixed(4));
}

@Injectable()
export class EmpenhosService {
  constructor(
    @InjectModel(Empenho.name) private readonly empenhoModel: Model<Empenho>,
    @InjectModel(ContratoHorti.name) private readonly contratoModel: Model<ContratoHorti>,
    @InjectModel(ListaCompras.name) private readonly listaModel: Model<ListaCompras>,
  ) {}

  async create(dto: CreateEmpenhoDto): Promise<EmpenhoDocument> {
    await this.validar(
      {
        contratoHortiId: dto.contratoHortiId,
        dataInicio: dto.dataInicio,
        dataFim: dto.dataFim,
        itensEmpenhados: dto.itensEmpenhados,
        ativo: dto.ativo !== false,
      },
      undefined,
    );
    try {
      return await this.empenhoModel.create(dto);
    } catch (error) {
      if (duplicado(error)) {
        throw new BadRequestException('Já existe empenho com este número neste contrato de hortifruti');
      }
      throw error;
    }
  }

  async findAll(query: QueryEmpenhoDto): Promise<EmpenhoDocument[]> {
    const filter: { contratoHortiId?: Types.ObjectId; ativo?: boolean } = {};
    if (query.contratoHortiId) {
      filter.contratoHortiId = new Types.ObjectId(query.contratoHortiId);
    }
    if (query.ativo !== undefined) {
      filter.ativo = query.ativo;
    }
    return this.empenhoModel.find(filter).sort({ dataInicio: 1, numeroEmpenho: 1 }).exec();
  }

  async findOne(id: string): Promise<EmpenhoDocument> {
    const empenho = await this.empenhoModel.findById(id).exec();
    if (!empenho) {
      throw new NotFoundException('Empenho não encontrado');
    }
    return empenho;
  }

  async update(id: string, dto: UpdateEmpenhoDto): Promise<EmpenhoDocument> {
    const atual = await this.findOne(id);
    await this.validar(
      {
        contratoHortiId: dto.contratoHortiId ?? atual.contratoHortiId.toString(),
        dataInicio: dto.dataInicio ?? atual.dataInicio,
        dataFim: dto.dataFim ?? atual.dataFim,
        itensEmpenhados: dto.itensEmpenhados ?? this.itensDoDocumento(atual),
        ativo: dto.ativo ?? atual.ativo,
      },
      id,
    );
    try {
      const empenho = await this.empenhoModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).exec();
      if (!empenho) {
        throw new NotFoundException('Empenho não encontrado');
      }
      return empenho;
    } catch (error) {
      if (duplicado(error)) {
        throw new BadRequestException('Já existe empenho com este número neste contrato de hortifruti');
      }
      throw error;
    }
  }

  async saldoDisponivel(contratoHortiId: string): Promise<
    Array<{
      alimentoId: string;
      unidadeMedida: string;
      qtdTotalLicitada: number;
      qtdEmpenhada: number;
      qtdDisponivel: number;
    }>
  > {
    const contrato = await this.contratoModel.findById(contratoHortiId).exec();
    if (!contrato) {
      throw new NotFoundException('Contrato de hortifruti não encontrado');
    }
    const saldos = [];
    for (const item of contrato.itens.filter((atual) => atual.ativo)) {
      const qtdEmpenhada = await this.somarQtdAtiva(contratoHortiId, item.alimentoId.toString());
      saldos.push({
        alimentoId: item.alimentoId.toString(),
        unidadeMedida: item.unidadeMedida,
        qtdTotalLicitada: item.qtdTotalLicitada,
        qtdEmpenhada,
        qtdDisponivel: Number((item.qtdTotalLicitada - qtdEmpenhada).toFixed(4)),
      });
    }
    return saldos;
  }

  /**
   * Saldo concorrente por alimento e empenho: `qtdEmpenhada` menos o que já foi
   * alocado em listas de compras confirmadas (CONFIRMADA/GERADA). Rascunhos e
   * canceladas não aparecem. Empenhos ordenados por vencimento (dataFim).
   * Sem `contratoHortiId`, agrega todos os contratos ativos — o empenho alocado
   * é quem define o contrato de cada item da lista.
   */
  async saldoConcorrente(contratoHortiId?: string): Promise<
    Array<{
      alimentoId: string;
      unidadeMedida: string;
      qtdTotalLicitada: number;
      qtdEmpenhada: number;
      qtdAlocada: number;
      qtdDisponivel: number;
      empenhos: Array<{
        empenhoId: string;
        numeroEmpenho: string;
        fonteRecurso: string;
        dataInicio: Date;
        dataFim: Date;
        qtdEmpenhada: number;
        qtdAlocada: number;
        saldoDisponivel: number;
      }>;
    }>
  > {
    const contratos = contratoHortiId
      ? [await this.buscarContrato(contratoHortiId)]
      : await this.contratoModel.find({ ativo: true }).exec();
    const [empenhos, listas] = await Promise.all([
      this.empenhoModel
        .find({ ...(contratoHortiId ? { contratoHortiId: new Types.ObjectId(contratoHortiId) } : {}), ativo: true })
        .exec(),
      // Sem filtro de contrato: o rateio é por empenhoId, então listas de
      // qualquer contrato (ou multi-contrato) já descontam o saldo certo.
      this.listaModel.find({ status: { $in: STATUS_LISTA_COMPRAS_QUE_ABATEM_SALDO } }).exec(),
    ]);
    const alocado = new Map<string, number>();
    const somar = (empenhoId: string, alimentoId: string, quantidade: number) => {
      const chave = `${empenhoId}:${alimentoId}`;
      alocado.set(chave, Number(((alocado.get(chave) ?? 0) + quantidade).toFixed(4)));
    };
    for (const lista of listas) {
      for (const alocacao of (lista.alocacoes ?? []) as Array<{
        alimentoId: string;
        rateios?: Array<{ empenhoId: string; quantidade: number }>;
      }>) {
        for (const rateio of alocacao.rateios ?? []) {
          somar(rateio.empenhoId, alocacao.alimentoId, rateio.quantidade);
        }
      }
      for (const item of (lista.consolidado ?? []) as Array<{
        empenhoId?: string;
        alimentoId: string;
        quantidadePedida: number;
      }>) {
        if (item.empenhoId) {
          somar(item.empenhoId, item.alimentoId, item.quantidadePedida);
        }
      }
    }
    const empenhosOrdenados = [...empenhos].sort(
      (a, b) => a.dataFim.getTime() - b.dataFim.getTime() || a.numeroEmpenho.localeCompare(b.numeroEmpenho),
    );
    const porAlimento = new Map<
      string,
      {
        alimentoId: string;
        unidadeMedida: string;
        qtdTotalLicitada: number;
        empenhos: Array<{
          empenhoId: string;
          numeroEmpenho: string;
          fonteRecurso: string;
          dataInicio: Date;
          dataFim: Date;
          qtdEmpenhada: number;
          qtdAlocada: number;
          saldoDisponivel: number;
        }>;
      }
    >();
    for (const contrato of contratos) {
      for (const item of contrato.itens.filter((atual) => atual.ativo)) {
        const alimentoId = item.alimentoId.toString();
        let agregado = porAlimento.get(alimentoId);
        if (!agregado) {
          agregado = {
            alimentoId,
            unidadeMedida: item.unidadeMedida,
            qtdTotalLicitada: item.qtdTotalLicitada,
            empenhos: [],
          };
          porAlimento.set(alimentoId, agregado);
        }
        const empenhosVistos = new Set(agregado.empenhos.map((atual) => atual.empenhoId));
        for (const empenho of empenhosOrdenados) {
          const empenhoId = empenho._id.toString();
          if (empenhosVistos.has(empenhoId)) continue;
          const itemEmpenho = empenho.itensEmpenhados.find((atual) => atual.alimentoId.toString() === alimentoId);
          if (!itemEmpenho) continue;
          const qtdAlocada = alocado.get(`${empenhoId}:${alimentoId}`) ?? 0;
          agregado.empenhos.push({
            empenhoId,
            numeroEmpenho: empenho.numeroEmpenho,
            fonteRecurso: empenho.fonteRecurso,
            dataInicio: empenho.dataInicio,
            dataFim: empenho.dataFim,
            qtdEmpenhada: itemEmpenho.qtdEmpenhada,
            qtdAlocada,
            saldoDisponivel: Number((itemEmpenho.qtdEmpenhada - qtdAlocada).toFixed(4)),
          });
        }
      }
    }
    return [...porAlimento.values()].map((agregado) => {
      const qtdEmpenhada = agregado.empenhos.reduce((soma, atual) => soma + atual.qtdEmpenhada, 0);
      const qtdAlocada = agregado.empenhos.reduce((soma, atual) => soma + atual.qtdAlocada, 0);
      return {
        alimentoId: agregado.alimentoId,
        unidadeMedida: agregado.unidadeMedida,
        qtdTotalLicitada: agregado.qtdTotalLicitada,
        qtdEmpenhada,
        qtdAlocada,
        qtdDisponivel: Number((agregado.qtdTotalLicitada - qtdEmpenhada).toFixed(4)),
        empenhos: agregado.empenhos,
      };
    });
  }

  private async buscarContrato(contratoHortiId: string): Promise<ContratoHortiDocument> {
    const contrato = await this.contratoModel.findById(contratoHortiId).exec();
    if (!contrato) {
      throw new NotFoundException('Contrato de hortifruti não encontrado');
    }
    return contrato;
  }

  async ativosPorAlimento(alimentoId: string): Promise<
    Array<{
      empenhoId: string;
      contratoHortiId: string;
      numeroEmpenho: string;
      fonteRecurso: string;
      dataInicio: Date;
      dataFim: Date;
      alimentoId: string;
      unidadeMedida: string;
      valorUnitario: number;
      qtdEmpenhada: number;
    }>
  > {
    const empenhos = await this.empenhoModel.find({ ativo: true, 'itensEmpenhados.alimentoId': new Types.ObjectId(alimentoId) }).exec();
    return empenhos.flatMap((empenho) => {
      const item = empenho.itensEmpenhados.find((atual) => atual.alimentoId.toString() === alimentoId);
      if (!item) {
        return [];
      }
      return [
        {
          empenhoId: empenho._id.toString(),
          contratoHortiId: empenho.contratoHortiId.toString(),
          numeroEmpenho: empenho.numeroEmpenho,
          fonteRecurso: empenho.fonteRecurso,
          dataInicio: empenho.dataInicio,
          dataFim: empenho.dataFim,
          alimentoId,
          unidadeMedida: item.unidadeMedida,
          valorUnitario: item.valorUnitario,
          qtdEmpenhada: item.qtdEmpenhada,
        },
      ];
    });
  }

  async remove(id: string): Promise<void> {
    const empenho = await this.empenhoModel.findByIdAndDelete(id).exec();
    if (!empenho) {
      throw new NotFoundException('Empenho não encontrado');
    }
  }

  private async validar(dados: PeriodoEmpenho, ignorarEmpenhoId: string | undefined): Promise<void> {
    if (dados.dataFim.getTime() < dados.dataInicio.getTime()) {
      throw new BadRequestException('dataFim não pode ser anterior a dataInicio');
    }
    const contrato = await this.contratoModel.findById(dados.contratoHortiId).exec();
    if (!contrato) {
      throw new NotFoundException('Contrato de hortifruti não encontrado');
    }
    if (dados.dataInicio.getTime() < contrato.vigenciaInicio.getTime()) {
      throw new BadRequestException('dataInicio não pode ser anterior à vigência do contrato');
    }
    if (dados.dataFim.getTime() > contrato.vigenciaFim.getTime()) {
      throw new BadRequestException('dataFim não pode ser posterior à vigência do contrato');
    }
    await this.validarItens(contrato, dados, ignorarEmpenhoId);
  }

  private async validarItens(
    contrato: ContratoHortiDocument,
    dados: PeriodoEmpenho,
    ignorarEmpenhoId: string | undefined,
  ): Promise<void> {
    const alimentos = new Set<string>();
    for (const item of dados.itensEmpenhados) {
      if (alimentos.has(item.alimentoId)) {
        throw new BadRequestException('itensEmpenhados contém alimento duplicado');
      }
      alimentos.add(item.alimentoId);
      this.assertPrevisaoUnica(item);
      const itemContrato = contrato.itens.find((atual) => atual.alimentoId.toString() === item.alimentoId);
      if (!itemContrato) {
        throw new BadRequestException('Alimento não faz parte dos itens do contrato de hortifruti');
      }
      // Unidade de medida e fator de conversão são herdados do item licitado:
      // omitidos assumem o valor do contrato; informados divergentes são erro.
      if (item.unidadeMedida === undefined || item.unidadeMedida === null) {
        item.unidadeMedida = itemContrato.unidadeMedida;
      } else if (item.unidadeMedida !== itemContrato.unidadeMedida) {
        throw new BadRequestException('Unidade de medida do empenho difere da unidade licitada no contrato');
      }
      const gramasContrato = (itemContrato as { gramasPorUnidade?: number | null }).gramasPorUnidade ?? null;
      if (item.gramasPorUnidade === undefined) {
        item.gramasPorUnidade = gramasContrato;
      } else if (item.gramasPorUnidade !== null && gramasContrato !== null && item.gramasPorUnidade !== gramasContrato) {
        throw new BadRequestException('gramasPorUnidade do empenho difere do item licitado no contrato');
      } else if (gramasContrato === null) {
        item.gramasPorUnidade = item.gramasPorUnidade ?? null;
      }
      if (!dados.ativo) {
        continue;
      }
      if (!itemContrato.ativo) {
        throw new BadRequestException('Alimento inativo no contrato não pode ser empenhado');
      }
      const somaOutros = await this.somarQtdAtiva(dados.contratoHortiId, item.alimentoId, ignorarEmpenhoId);
      if (ultrapassa(somaOutros + item.qtdEmpenhada, itemContrato.qtdTotalLicitada)) {
        throw new BadRequestException(
          'A quantidade empenhada do alimento ultrapassa a quantidade total licitada do contrato',
        );
      }
    }
  }

  private assertPrevisaoUnica(item: ItemEmpenhoDto): void {
    const chaves = (item.previsaoMensal ?? []).map((previsao) => `${previsao.ano}-${previsao.mes}`);
    if (new Set(chaves).size !== chaves.length) {
      throw new BadRequestException('previsaoMensal não pode repetir o mesmo mês e ano');
    }
  }

  private async somarQtdAtiva(contratoHortiId: string, alimentoId: string, ignorarEmpenhoId?: string): Promise<number> {
    const empenhos = await this.empenhoModel
      .find({
        contratoHortiId: new Types.ObjectId(contratoHortiId),
        ativo: true,
        ...(ignorarEmpenhoId ? { _id: { $ne: ignorarEmpenhoId } } : {}),
      })
      .exec();
    let soma = 0;
    for (const empenho of empenhos) {
      for (const item of empenho.itensEmpenhados) {
        if (item.alimentoId.toString() === alimentoId) {
          soma += item.qtdEmpenhada;
        }
      }
    }
    return soma;
  }

  private itensDoDocumento(empenho: EmpenhoDocument): ItemEmpenhoDto[] {
    return empenho.itensEmpenhados.map((item) => ({
      alimentoId: item.alimentoId.toString(),
      qtdEmpenhada: item.qtdEmpenhada,
      unidadeMedida: item.unidadeMedida,
      gramasPorUnidade: (item as { gramasPorUnidade?: number | null }).gramasPorUnidade ?? null,
      valorUnitario: item.valorUnitario,
      previsaoMensal: item.previsaoMensal.map((previsao) => ({
        mes: previsao.mes,
        ano: previsao.ano,
        qtdPrevista: previsao.qtdPrevista,
      })),
    }));
  }
}

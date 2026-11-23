import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StatusAlimentacaoEspecial, StatusCardapio, TipoCardapio } from '../../common/enums/index.js';
import { Alimento } from '../alimentos/schemas/alimento.schema.js';
import { AlimentacaoEspecialService } from '../alimentacao-especial/alimentacao-especial.service.js';
import { ConfiguracoesService } from '../configuracoes/configuracoes.service.js';
import { ContratoHorti, type ContratoHortiDocument } from '../contratos-horti/schemas/contrato-horti.schema.js';
import { ErudioAdapterService } from '../erudio/erudio-adapter.service.js';
import { Empenho } from '../empenhos/schemas/empenho.schema.js';
import { RegrasRefeicaoService } from '../regras-refeicao/regras-refeicao.service.js';
import { calcularRomaneio, type ItemPendente, type ResultadoRomaneio } from './calcular-romaneio.js';
import { AlocacaoAlimentoDto, SimularListaComprasDto } from './dto/simular-lista-compras.dto.js';
import { QueryListaComprasDto } from './dto/query-lista-compras.dto.js';
import { AlimentacaoEspecial } from './schemas/alimentacao-especial.schema.js';
import { CardapioLeitura } from './schemas/cardapio-leitura.schema.js';
import { FichaTecnica } from '../fichas-tecnicas/schemas/ficha-tecnica.schema.js';
import {
  ListaCompras,
  STATUS_LISTA_COMPRAS_QUE_ABATEM_SALDO,
  type ListaComprasDocument,
  type StatusListaCompras,
} from './schemas/lista-compras.schema.js';

function diaUtc(data: Date): string {
  return data.toISOString().slice(0, 10);
}

/** Mescla os itens de vários contratos, ficando com o primeiro por alimentoId. */
function itensContratoUnicos(contratos: ContratoHortiDocument[]) {
  const vistos = new Set<string>();
  const itens = [];
  for (const contrato of contratos) {
    for (const item of contrato.itens) {
      const alimentoId = item.alimentoId.toString();
      if (vistos.has(alimentoId)) continue;
      vistos.add(alimentoId);
      itens.push(item);
    }
  }
  return itens;
}

@Injectable()
export class ListasComprasService {
  constructor(
    @InjectModel(ContratoHorti.name) private readonly contratoModel: Model<ContratoHorti>,
    @InjectModel(Empenho.name) private readonly empenhoModel: Model<Empenho>,
    @InjectModel(Alimento.name) private readonly alimentoModel: Model<Alimento>,
    @InjectModel(CardapioLeitura.name) private readonly cardapioModel: Model<CardapioLeitura>,
    @InjectModel(FichaTecnica.name) private readonly fichaModel: Model<FichaTecnica>,
    @InjectModel(AlimentacaoEspecial.name) private readonly especialModel: Model<AlimentacaoEspecial>,
    @InjectModel(ListaCompras.name) private readonly listaModel: Model<ListaCompras>,
    private readonly erudio: ErudioAdapterService,
    private readonly regrasRefeicao: RegrasRefeicaoService,
    private readonly configuracoes: ConfiguracoesService,
    private readonly alimentacaoEspecial: AlimentacaoEspecialService,
  ) {}

  async simular(dto: SimularListaComprasDto): Promise<ResultadoRomaneio> {
    return this.calcular(dto);
  }

  async gerar(dto: SimularListaComprasDto): Promise<ListaComprasDocument> {
    const resultado = await this.calcular(dto);
    // O contrato da lista é derivado dos empenhos efetivamente alocados —
    // uma lista pode tocar mais de um contrato de hortifruti.
    const empenhoIds = [...new Set(resultado.alocacoesEfetivas.flatMap((alocacao) => alocacao.rateios.map((rateio) => rateio.empenhoId)))];
    const empenhosAlocados = empenhoIds.length
      ? await this.empenhoModel.find({ _id: { $in: empenhoIds.map((id) => new Types.ObjectId(id)) } }).exec()
      : [];
    const contratoHortiIds = [...new Set(empenhosAlocados.map((empenho) => empenho.contratoHortiId.toString()))].map(
      (id) => new Types.ObjectId(id),
    );
    return this.listaModel.create({
      contratoHortiId: dto.contratoHortiId ? new Types.ObjectId(dto.contratoHortiId) : (contratoHortiIds[0] ?? undefined),
      contratoHortiIds: contratoHortiIds.length ? contratoHortiIds : dto.contratoHortiId ? [new Types.ObjectId(dto.contratoHortiId)] : [],
      datasConsumo: dto.datasConsumo,
      erudioEtapaIds: dto.erudioEtapaIds ?? [],
      erudioUnidadeEnsinoIds: dto.erudioUnidadeEnsinoIds ?? [],
      status: dto.rascunho ? 'RASCUNHO' : 'CONFIRMADA',
      datasConsideradas: resultado.datasConsideradas,
      datasIgnoradas: resultado.datasIgnoradas,
      consolidado: resultado.consolidado,
      romaneio: resultado.romaneio,
      alocacoes: resultado.alocacoesEfetivas,
      itensPendentes: resultado.itensPendentes,
    });
  }

  async findAll(query: QueryListaComprasDto): Promise<ListaComprasDocument[]> {
    const filter: {
      $or?: Array<{ contratoHortiId: Types.ObjectId } | { contratoHortiIds: Types.ObjectId }>;
      status?: StatusListaCompras;
    } = {};
    if (query.contratoHortiId) {
      const oid = new Types.ObjectId(query.contratoHortiId);
      filter.$or = [{ contratoHortiId: oid }, { contratoHortiIds: oid }];
    }
    if (query.status) {
      filter.status = query.status;
    }
    return this.listaModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<ListaComprasDocument> {
    const lista = await this.listaModel.findById(id).exec();
    if (!lista) {
      throw new NotFoundException('Lista de compras não encontrada');
    }
    return lista;
  }

  /**
   * Confirma um rascunho: recalcula o romaneio com os rateios gravados e
   * bloqueia se o saldo atual dos empenhos não cobrir mais a demanda.
   */
  async confirmar(id: string): Promise<ListaComprasDocument> {
    const lista = await this.findOne(id);
    if (lista.status === 'CONFIRMADA' || lista.status === 'GERADA') {
      return lista;
    }
    if (lista.status !== 'RASCUNHO') {
      throw new BadRequestException('Apenas listas em rascunho podem ser confirmadas');
    }
    const alocacoes = (lista.alocacoes ?? []) as AlocacaoAlimentoDto[];
    const resultado = await this.calcular({
      contratoHortiId: lista.contratoHortiId?.toString(),
      datasConsumo: lista.datasConsumo,
      erudioEtapaIds: lista.erudioEtapaIds?.length ? lista.erudioEtapaIds : undefined,
      erudioUnidadeEnsinoIds: lista.erudioUnidadeEnsinoIds?.length ? lista.erudioUnidadeEnsinoIds : undefined,
      alocacoes: alocacoes.length > 0 ? alocacoes : undefined,
    });
    const bloqueios = resultado.itensPendentes.filter(
      (pendencia) => pendencia.motivo === 'SEM_SALDO' || pendencia.motivo === 'RATEIO_INSUFICIENTE',
    );
    if (bloqueios.length > 0) {
      throw new BadRequestException({
        message: 'O saldo atual dos empenhos não cobre mais a lista; revise os rateios antes de confirmar',
        pendencias: bloqueios satisfies ItemPendente[],
      });
    }
    lista.status = 'CONFIRMADA';
    return lista.save();
  }

  /** Cancela a lista: rascunhos somem do fluxo e confirmadas liberam o saldo dos empenhos. */
  async cancelar(id: string): Promise<ListaComprasDocument> {
    const lista = await this.findOne(id);
    if (lista.status === 'CANCELADA') {
      return lista;
    }
    lista.status = 'CANCELADA';
    return lista.save();
  }

  private async calcular(dto: SimularListaComprasDto): Promise<ResultadoRomaneio> {
    // Sem contratoHortiId a lista é dirigida pela demanda: itens de TODOS os
    // contratos ativos viram candidatos e o empenho alocado define o contrato.
    let contratos;
    if (dto.contratoHortiId) {
      const contrato = await this.contratoModel.findById(dto.contratoHortiId).exec();
      if (!contrato) throw new NotFoundException('Contrato de hortifruti não encontrado');
      contratos = [contrato];
    } else {
      contratos = await this.contratoModel.find({ ativo: true }).exec();
    }
    const datas = [...new Set(dto.datasConsumo.map(diaUtc))];
    const cardapios = await this.cardapioModel.find({ tipo: TipoCardapio.MENSAL, status: StatusCardapio.PRONTO }).exec();
    const dias = cardapios.flatMap((cardapio) =>
      cardapio.dias
        .filter((dia) => dia.data && datas.includes(diaUtc(dia.data)))
        .map((dia) => ({
          data: diaUtc(dia.data as Date),
          erudioEtapaId: dia.erudioEtapaId || cardapio.erudioEtapaId,
          tipoDia: dia.tipoDia,
          refeicoes: dia.refeicoes.map((refeicao) => ({
            refeicao: refeicao.refeicao,
            itens: refeicao.itens.map((item) => ({
              operador: item.operador,
              ativoParaCompra: item.ativoParaCompra,
              fichaTecnicaId: item.fichaTecnicaId,
              alimentoId: item.alimentoId,
              perCapitaBruto: item.perCapitaBruto,
              perCapitaLiquido: item.perCapitaLiquido,
              porcaoServidaGramas: item.porcaoServidaGramas,
            })),
          })),
        })),
    );
    const etapaIds = [...new Set(dias.map((dia) => dia.erudioEtapaId))];
    const [fichas, alimentos, empenhos, especiais, listas, demandas, regras, matriculas, almocoContraturno, adaptacoes] =
      await Promise.all([
        this.fichaModel.find().exec(),
        this.alimentoModel.find().exec(),
        this.empenhoModel
          .find(dto.contratoHortiId ? { contratoHortiId: new Types.ObjectId(dto.contratoHortiId) } : {})
          .exec(),
        this.especialModel.find({ status: StatusAlimentacaoEspecial.DEFERIDO, erudioEtapaId: { $in: etapaIds } }).exec(),
        this.listaModel
          .find({
            ...(dto.contratoHortiId ? { contratoHortiId: new Types.ObjectId(dto.contratoHortiId) } : {}),
            status: { $in: STATUS_LISTA_COMPRAS_QUE_ABATEM_SALDO },
          })
          .exec(),
        this.erudio.alunosAtivosPorEtapa(etapaIds),
        this.regrasRefeicao.listarRegras({}),
        this.erudio.matriculasPorEtapa(etapaIds),
        this.configuracoes.obterParametrosAlmocoContraturno(),
        this.alimentacaoEspecial.adaptacoesParaCalculo(etapaIds),
      ]);
    const consumosAnteriores = listas.flatMap((lista) => {
      const porAlocacao = ((lista.alocacoes ?? []) as Array<{ alimentoId: string; rateios?: Array<{ empenhoId: string; quantidade: number }> }>)
        .flatMap((alocacao) =>
          (alocacao.rateios ?? []).map((rateio) => ({
            empenhoId: rateio.empenhoId,
            alimentoId: alocacao.alimentoId,
            quantidade: rateio.quantidade,
          })),
        );
      const legado = (lista.consolidado as Array<{ empenhoId?: string; alimentoId: string; quantidadePedida: number }>)
        .filter((item) => item.empenhoId)
        .map((item) => ({
          empenhoId: item.empenhoId as string,
          alimentoId: item.alimentoId,
          quantidade: item.quantidadePedida,
        }));
      return [...porAlocacao, ...legado];
    });
    const resultado = calcularRomaneio({
      datasSelecionadas: datas,
      erudioEtapaIds: dto.erudioEtapaIds,
      erudioUnidadeEnsinoIds: dto.erudioUnidadeEnsinoIds,
      dias,
      fichas: fichas.map((ficha) => ({
        id: ficha._id.toString(),
        rendimentoTotalGramas: ficha.rendimentoTotalGramas,
        ingredientes: ficha.ingredientes,
      })),
      alimentos: alimentos.map((alimento) => ({
        id: alimento._id.toString(),
        nome: alimento.nome,
        categoria: alimento.categoria,
      })),
      itensContrato: itensContratoUnicos(contratos).map((item) => ({
        alimentoId: item.alimentoId.toString(),
        unidadeMedida: item.unidadeMedida,
        valorUnitario: item.valorUnitario,
        ativo: item.ativo,
        gramasPorUnidade: item.gramasPorUnidade ?? null,
        fatorCorrecao: item.fatorCorrecao ?? null,
      })),
      empenhos: empenhos.map((empenho) => ({
        id: empenho._id.toString(),
        contratoHortiId: empenho.contratoHortiId.toString(),
        numeroEmpenho: empenho.numeroEmpenho,
        ativo: empenho.ativo,
        dataFim: empenho.dataFim,
        itensEmpenhados: empenho.itensEmpenhados.map((item) => ({
          alimentoId: item.alimentoId.toString(),
          qtdEmpenhada: item.qtdEmpenhada,
          unidadeMedida: item.unidadeMedida,
          valorUnitario: item.valorUnitario,
          gramasPorUnidade: item.gramasPorUnidade ?? null,
        })),
      })),
      demandas,
      matriculas,
      configuracoesAlmocoContraturno: almocoContraturno.unidades,
      alocacaoAlmocoContraturnoPadrao: almocoContraturno.alocacaoAlmocoContraturnoPadrao,
      adaptacoes,
      regrasRefeicao: regras.map((regra) => ({
        erudioEtapaId: regra.erudioEtapaId,
        erudioTurnoId: regra.erudioTurnoId,
        refeicaoId: regra.refeicaoId,
        erudioUnidadeEnsinoId: regra.erudioUnidadeEnsinoId,
        ativo: regra.ativo,
      })),
      especiais: especiais.map((especial) => ({
        erudioMatriculaId: especial.erudioMatriculaId,
        erudioUnidadeEnsinoId: especial.erudioUnidadeEnsinoId,
        erudioEtapaId: especial.erudioEtapaId,
        status: especial.status,
        alimentosNaoUtilizadosIds: especial.alimentosNaoUtilizadosIds,
        alimentosUtilizadosIds: especial.alimentosUtilizadosIds,
        restricaoIds: especial.restricaoIds,
        erudioAlunoId: especial.erudioAlunoId,
      })),
      consumosAnteriores,
      alocacoes: dto.alocacoes?.map((alocacao) => ({
        alimentoId: alocacao.alimentoId,
        rateios: alocacao.rateios.map((rateio) => ({ empenhoId: rateio.empenhoId, quantidade: rateio.quantidade })),
      })),
      // Flag por contrato; com múltiplos contratos vale a do primeiro (quando
      // contratoHortiId é informado, é exatamente o comportamento anterior).
      arredondamentoTotalAlimentos: contratos[0]?.arredondamentoTotalAlimentos ?? false,
    });
    return resultado;
  }
}

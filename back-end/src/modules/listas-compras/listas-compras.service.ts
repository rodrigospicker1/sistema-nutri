import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StatusAlimentacaoEspecial, StatusCardapio, TipoCardapio } from '../../common/enums/index.js';
import { Alimento } from '../alimentos/schemas/alimento.schema.js';
import { AlimentacaoEspecialService } from '../alimentacao-especial/alimentacao-especial.service.js';
import { ConfiguracoesService } from '../configuracoes/configuracoes.service.js';
import { ContratoHorti } from '../contratos-horti/schemas/contrato-horti.schema.js';
import { ErudioAdapterService } from '../erudio/erudio-adapter.service.js';
import { Empenho } from '../empenhos/schemas/empenho.schema.js';
import { RegrasRefeicaoService } from '../regras-refeicao/regras-refeicao.service.js';
import { calcularRomaneio, type ResultadoRomaneio } from './calcular-romaneio.js';
import { SimularListaComprasDto } from './dto/simular-lista-compras.dto.js';
import { AlimentacaoEspecial } from './schemas/alimentacao-especial.schema.js';
import { CardapioLeitura } from './schemas/cardapio-leitura.schema.js';
import { FichaTecnica } from '../fichas-tecnicas/schemas/ficha-tecnica.schema.js';
import { ListaCompras, type ListaComprasDocument } from './schemas/lista-compras.schema.js';

function diaUtc(data: Date): string {
  return data.toISOString().slice(0, 10);
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
    return this.listaModel.create({
      contratoHortiId: dto.contratoHortiId,
      datasConsumo: dto.datasConsumo,
      status: 'GERADA',
      datasConsideradas: resultado.datasConsideradas,
      datasIgnoradas: resultado.datasIgnoradas,
      consolidado: resultado.consolidado,
      romaneio: resultado.romaneio,
      alocacoes: dto.alocacoes ?? [],
      itensPendentes: resultado.itensPendentes,
    });
  }

  private async calcular(dto: SimularListaComprasDto): Promise<ResultadoRomaneio> {
    const contrato = await this.contratoModel.findById(dto.contratoHortiId).exec();
    if (!contrato) throw new NotFoundException('Contrato de hortifruti não encontrado');
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
        this.empenhoModel.find({ contratoHortiId: new Types.ObjectId(dto.contratoHortiId) }).exec(),
        this.especialModel.find({ status: StatusAlimentacaoEspecial.DEFERIDO, erudioEtapaId: { $in: etapaIds } }).exec(),
        this.listaModel.find({ contratoHortiId: new Types.ObjectId(dto.contratoHortiId), status: 'GERADA' }).exec(),
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
      itensContrato: contrato.itens.map((item) => ({
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
      arredondamentoTotalAlimentos: contrato.arredondamentoTotalAlimentos,
    });
    return resultado;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrigemRegraIncidencia, TipoAlvoIncidencia } from '../../common/enums/index.js';
import { Alimento } from '../alimentos/schemas/alimento.schema.js';
import { GrupoIncidencia } from '../alimentos/schemas/grupo-incidencia.schema.js';
import { FichaTecnica } from '../fichas-tecnicas/schemas/ficha-tecnica.schema.js';
import { CardapioLeitura } from '../listas-compras/schemas/cardapio-leitura.schema.js';
import { IncidenciaRegra, type IncidenciaRegraDocument } from './schemas/incidencia-regra.schema.js';
import { validarIncidencias, type ResultadoIncidencia } from './validar-incidencias.js';

@Injectable()
export class ValidarCardapioIncidenciaService {
  constructor(
    @InjectModel(CardapioLeitura.name) private readonly cardapioModel: Model<CardapioLeitura>,
    @InjectModel(IncidenciaRegra.name) private readonly regraModel: Model<IncidenciaRegra>,
    @InjectModel(Alimento.name) private readonly alimentoModel: Model<Alimento>,
    @InjectModel(GrupoIncidencia.name) private readonly grupoModel: Model<GrupoIncidencia>,
    @InjectModel(FichaTecnica.name) private readonly fichaModel: Model<FichaTecnica>,
  ) {}

  async validar(cardapioId: string): Promise<ResultadoIncidencia> {
    const cardapio = await this.cardapioModel.findById(cardapioId).exec();
    if (!cardapio) throw new NotFoundException('Cardápio não encontrado');
    const agrupamentoId = cardapio.agrupamentoCardapioId?.toString();
    const regras = agrupamentoId
      ? await this.regraModel.find({ ativo: true, agrupamentoCardapioId: new Types.ObjectId(agrupamentoId) }).exec()
      : [];
    const [alimentos, grupos, fichas] = await Promise.all([
      this.alimentoModel.find().exec(),
      this.grupoModel.find().exec(),
      this.fichaModel.find().exec(),
    ]);
    const gruposPorId = new Map(grupos.map((grupo) => [grupo.id as string, grupo]));
    const alimentosPorId = new Map(alimentos.map((alimento) => [alimento.id as string, alimento]));
    const fichasPorId = new Map(fichas.map((ficha) => [ficha.id as string, ficha]));

    return validarIncidencias({
      dias: cardapio.dias.map((dia) => ({
        numeroSemana: dia.numeroSemana,
        tipoDia: dia.tipoDia,
        refeicoes: dia.refeicoes.map((refeicao) => ({
          itens: refeicao.itens.map((item) => ({
            operador: item.operador,
            ativoParaCompra: item.ativoParaCompra,
            fichaTecnicaId: item.fichaTecnicaId,
            alimentoId: item.alimentoId,
          })),
        })),
      })),
      regras: regras.map((regra) => this.mapRegra(regra, gruposPorId, alimentosPorId, fichasPorId)),
      alimentos: alimentos.map((alimento) => ({
        id: alimento.id as string,
        nome: alimento.nome,
        gruposIncidenciaIds: alimento.gruposIncidenciaIds.map((id) => id.toString()),
      })),
      fichas: fichas.map((ficha) => ({
        id: ficha.id as string,
        nome: ficha.nome ?? `Ficha ${ficha.id}`,
        gruposIncidenciaIds: ficha.gruposIncidenciaIds.map((id) => id.toString()),
        ingredientes: ficha.ingredientes.map((ingrediente) => ({ alimentoId: ingrediente.alimentoId })),
      })),
    });
  }

  private mapRegra(
    regra: IncidenciaRegraDocument,
    gruposPorId: Map<string, GrupoIncidencia>,
    alimentosPorId: Map<string, Alimento>,
    fichasPorId: Map<string, FichaTecnica>,
  ) {
    const grupo = regra.grupoIncidenciaId ? gruposPorId.get(regra.grupoIncidenciaId.toString()) : undefined;
    const alimento = regra.alimentoId ? alimentosPorId.get(regra.alimentoId.toString()) : undefined;
    const ficha = regra.fichaTecnicaId ? fichasPorId.get(regra.fichaTecnicaId.toString()) : undefined;
    const tipoAlvo = regra.tipoAlvo ?? (regra.grupoIncidenciaId ? TipoAlvoIncidencia.GRUPO : regra.alimentoId ? TipoAlvoIncidencia.ALIMENTO : TipoAlvoIncidencia.FICHA_TECNICA);
    return {
      id: regra.id,
      tipoAlvo,
      grupoIncidenciaId: regra.grupoIncidenciaId?.toString() ?? null,
      fichaTecnicaId: regra.fichaTecnicaId?.toString() ?? null,
      alimentoId: regra.alimentoId?.toString() ?? null,
      periodo: regra.periodo,
      frequenciaMinima: regra.frequenciaMinima,
      frequenciaMaxima: regra.frequenciaMaxima,
      origemRegra: grupo?.origemRegra
        ?? (regra.contratoTerceirizadaId ? OrigemRegraIncidencia.CONTRATO_TERCEIRIZADA : OrigemRegraIncidencia.LEI_PNAE),
      alvoNome: grupo?.nome ?? ficha?.nome ?? alimento?.nome ?? 'Item da regra',
      categoriaVisual: grupo?.categoriaVisual ?? 'OUTROS',
    };
  }
}
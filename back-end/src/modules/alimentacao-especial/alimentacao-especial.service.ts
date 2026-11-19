import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StatusAlimentacaoEspecial, TipoCardapio } from '../../common/enums/index.js';
import { Cardapio } from '../cardapios/schemas/cardapio.schema.js';
import { AlimentacaoEspecial } from '../listas-compras/schemas/alimentacao-especial.schema.js';
import type { AdaptacaoCalculo } from '../listas-compras/calcular-romaneio.js';
import { AdaptacaoCardapio } from './schemas/adaptacao-cardapio.schema.js';
import { AdaptacaoOverride } from './schemas/adaptacao-override.schema.js';
import { TipoRestricao } from './schemas/tipo-restricao.schema.js';
import type { CreateAdaptacaoDto, SalvarOverridesDto, UpdateAdaptacaoDto } from './dto/adaptacao.dto.js';

function diaIso(data: Date): string {
  return data.toISOString().slice(0, 10);
}

@Injectable()
export class AlimentacaoEspecialService {
  constructor(
    @InjectModel(TipoRestricao.name) private readonly restricaoModel: Model<TipoRestricao>,
    @InjectModel(AdaptacaoCardapio.name) private readonly adaptacaoModel: Model<AdaptacaoCardapio>,
    @InjectModel(AdaptacaoOverride.name) private readonly overrideModel: Model<AdaptacaoOverride>,
    @InjectModel(AlimentacaoEspecial.name) private readonly laudoModel: Model<AlimentacaoEspecial>,
    @InjectModel(Cardapio.name) private readonly cardapioModel: Model<Cardapio>,
  ) {}

  // ---------- Catálogo de restrições ----------

  listarTiposRestricao() {
    return this.restricaoModel.find().sort({ nome: 1 }).exec();
  }

  criarTipoRestricao(dto: { id: string; nome: string; ativo?: boolean }) {
    return this.restricaoModel.create({ id: dto.id, nome: dto.nome, ativo: dto.ativo ?? true });
  }

  atualizarTipoRestricao(id: string, dto: { nome?: string; ativo?: boolean }) {
    return this.restricaoModel.findOneAndUpdate({ id }, dto, { new: true, runValidators: true }).exec();
  }

  async removerTipoRestricao(id: string) {
    const emUso = await this.laudoModel.countDocuments({ restricaoIds: id }).exec();
    if (emUso > 0) throw new BadRequestException(`Restrição '${id}' está em uso por ${emUso} laudo(s)`);
    const resultado = await this.restricaoModel.deleteOne({ id }).exec();
    if (resultado.deletedCount === 0) throw new NotFoundException(`Restrição '${id}' não encontrada`);
    return { removido: true };
  }

  // ---------- Restrições ativas por etapa ----------

  /** Laudos DEFERIDO agrupados por restrição, com contagem de alunos distintos. */
  async restricoesAtivas(erudioEtapaId?: number) {
    const filter: Record<string, unknown> = { status: StatusAlimentacaoEspecial.DEFERIDO, restricaoIds: { $exists: true, $ne: [] } };
    if (erudioEtapaId !== undefined) filter.erudioEtapaId = erudioEtapaId;
    const laudos = await this.laudoModel.find(filter).exec();
    const alunosPorRestricao = new Map<string, Set<string>>();
    const conflitos = new Map<string, number>();
    for (const laudo of laudos) {
      const chaveAluno = String(laudo.erudioAlunoId ?? laudo.erudioMatriculaId);
      for (const restricaoId of laudo.restricaoIds ?? []) {
        const conjunto = alunosPorRestricao.get(restricaoId) ?? new Set<string>();
        conjunto.add(chaveAluno);
        alunosPorRestricao.set(restricaoId, conjunto);
      }
      if ((laudo.restricaoIds ?? []).length > 1) {
        conflitos.set(chaveAluno, (conflitos.get(chaveAluno) ?? 0) + 1);
      }
    }
    const tipos = await this.restricaoModel.find().exec();
    const nomes = new Map(tipos.map((tipo) => [tipo.id, tipo.nome]));
    return {
      restricoes: [...alunosPorRestricao.entries()].map(([restricaoId, alunos]) => ({
        restricaoId,
        nome: nomes.get(restricaoId) ?? restricaoId,
        alunosAtivos: alunos.size,
      })),
      alunosComMultiplasRestricoes: conflitos.size,
    };
  }

  // ---------- Perfis de adaptação ----------

  async listarAdaptacoes(filtro: { cardapioId?: string; erudioEtapaId?: number } = {}) {
    const filter: Record<string, unknown> = {};
    if (filtro.cardapioId) {
      if (!Types.ObjectId.isValid(filtro.cardapioId)) throw new BadRequestException('cardapioId inválido');
      filter.cardapioId = new Types.ObjectId(filtro.cardapioId);
    }
    const adaptacoes = await this.adaptacaoModel.find(filter).sort({ prioridade: 1, nome: 1 }).exec();
    if (adaptacoes.length === 0) return [];
    const overrides = await this.overrideModel.find({ adaptacaoId: { $in: adaptacoes.map((a) => a._id) } }).exec();
    const porAdaptacao = new Map<string, typeof overrides>();
    for (const override of overrides) {
      const chave = override.adaptacaoId.toString();
      const lista = porAdaptacao.get(chave) ?? [];
      lista.push(override);
      porAdaptacao.set(chave, lista);
    }
    const cardapios = await this.cardapioModel
      .find({ _id: { $in: adaptacoes.map((a) => a.cardapioId) } })
      .select('nome erudioEtapaId mes ano')
      .exec();
    const cardapioPorId = new Map(cardapios.map((cardapio) => [cardapio._id.toString(), cardapio]));
    return adaptacoes.map((adaptacao) => {
      const cardapio = cardapioPorId.get(adaptacao.cardapioId.toString());
      return {
        id: adaptacao._id.toString(),
        cardapioId: adaptacao.cardapioId.toString(),
        cardapioNome: cardapio?.nome,
        erudioEtapaId: cardapio?.erudioEtapaId,
        nome: adaptacao.nome,
        prioridade: adaptacao.prioridade,
        restricoesIds: adaptacao.restricoesIds,
        ativo: adaptacao.ativo,
        overrides: (porAdaptacao.get(adaptacao._id.toString()) ?? []).map((override) => ({
          data: diaIso(override.data),
          refeicao: override.refeicao,
          itens: override.itens,
        })),
      };
    });
  }

  async criarAdaptacao(dto: CreateAdaptacaoDto) {
    if (!Types.ObjectId.isValid(dto.cardapioId)) throw new BadRequestException('cardapioId inválido');
    const cardapio = await this.cardapioModel.findById(dto.cardapioId).exec();
    if (!cardapio) throw new NotFoundException('Cardápio não encontrado');
    return this.adaptacaoModel.create({
      cardapioId: new Types.ObjectId(dto.cardapioId),
      nome: dto.nome,
      prioridade: dto.prioridade ?? 1,
      restricoesIds: dto.restricoesIds ?? [],
      ativo: true,
    });
  }

  async atualizarAdaptacao(id: string, dto: UpdateAdaptacaoDto) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('id inválido');
    const adaptacao = await this.adaptacaoModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).exec();
    if (!adaptacao) throw new NotFoundException('Adaptação não encontrada');
    return adaptacao;
  }

  async removerAdaptacao(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('id inválido');
    await this.overrideModel.deleteMany({ adaptacaoId: new Types.ObjectId(id) }).exec();
    const resultado = await this.adaptacaoModel.deleteOne({ _id: id }).exec();
    if (resultado.deletedCount === 0) throw new NotFoundException('Adaptação não encontrada');
    return { removido: true };
  }

  async salvarOverrides(id: string, dto: SalvarOverridesDto) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('id inválido');
    const adaptacao = await this.adaptacaoModel.findById(id).exec();
    if (!adaptacao) throw new NotFoundException('Adaptação não encontrada');
    const objectId = new Types.ObjectId(id);
    await this.overrideModel.deleteMany({
      adaptacaoId: objectId,
      $nor: dto.overrides.map((override) => ({
        data: new Date(`${override.data.slice(0, 10)}T00:00:00.000Z`),
        refeicao: override.refeicao,
      })),
    }).exec();
    for (const override of dto.overrides) {
      await this.overrideModel.updateOne(
        { adaptacaoId: objectId, data: new Date(`${override.data.slice(0, 10)}T00:00:00.000Z`), refeicao: override.refeicao },
        {
          $set: {
            itens: override.itens.map((item) => ({
              operador: item.operador ?? null,
              ativoParaCompra: item.ativoParaCompra ?? true,
              fichaTecnicaId: item.fichaTecnicaId,
              alimentoId: item.alimentoId,
              perCapitaBruto: item.perCapitaBruto,
              porcaoServidaGramas: item.porcaoServidaGramas,
            })),
          },
        },
        { upsert: true },
      );
    }
    return this.listarAdaptacoes({ cardapioId: adaptacao.cardapioId.toString() });
  }

  /** Remove um único override — a refeição volta a herdar o cardápio principal. */
  async removerOverride(id: string, data: string, refeicao: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('id inválido');
    const adaptacao = await this.adaptacaoModel.findById(id).exec();
    if (!adaptacao) throw new NotFoundException('Adaptação não encontrada');
    await this.overrideModel
      .deleteOne({
        adaptacaoId: new Types.ObjectId(id),
        data: new Date(`${data.slice(0, 10)}T00:00:00.000Z`),
        refeicao,
      })
      .exec();
    return this.listarAdaptacoes({ cardapioId: adaptacao.cardapioId.toString() });
  }

  /** Cardápio do perfil consolidado: principal + overrides (delta). */
  async cardapioConsolidado(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('id inválido');
    const adaptacoes = await this.listarAdaptacoes();
    const adaptacao = adaptacoes.find((item) => item.id === id);
    if (!adaptacao) throw new NotFoundException('Adaptação não encontrada');
    const cardapio = await this.cardapioModel.findById(adaptacao.cardapioId).exec();
    if (!cardapio) throw new NotFoundException('Cardápio não encontrado');
    const overrides = new Map(adaptacao.overrides.map((override) => [`${override.data}|${override.refeicao}`, override.itens]));
    return {
      adaptacao,
      cardapio: {
        ...cardapio.toObject(),
        dias: cardapio.dias.map((dia) => ({
          ...dia,
          refeicoes: dia.refeicoes.map((refeicao) => {
            const chave = dia.data ? `${diaIso(dia.data)}|${refeicao.refeicao}` : null;
            const override = chave ? overrides.get(chave) : undefined;
            return override
              ? { refeicao: refeicao.refeicao, itens: override, adaptado: true }
              : { ...refeicao, adaptado: false };
          }),
        })),
      },
    };
  }

  // ---------- Insumo do cálculo da lista de compras ----------

  /** Adaptações ativas dos cardápios MENSAL das etapas, no formato do motor. */
  async adaptacoesParaCalculo(erudioEtapaIds: number[]): Promise<AdaptacaoCalculo[]> {
    if (erudioEtapaIds.length === 0) return [];
    const cardapios = await this.cardapioModel
      .find({ tipo: TipoCardapio.MENSAL, erudioEtapaId: { $in: erudioEtapaIds } })
      .select('_id erudioEtapaId')
      .exec();
    if (cardapios.length === 0) return [];
    const etapaPorCardapio = new Map(cardapios.map((cardapio) => [cardapio._id.toString(), cardapio.erudioEtapaId]));
    const adaptacoes = await this.adaptacaoModel
      .find({ cardapioId: { $in: cardapios.map((cardapio) => cardapio._id) }, ativo: true })
      .exec();
    if (adaptacoes.length === 0) return [];
    const overrides = await this.overrideModel.find({ adaptacaoId: { $in: adaptacoes.map((a) => a._id) } }).exec();
    const overridesPorAdaptacao = new Map<string, typeof overrides>();
    for (const override of overrides) {
      const chave = override.adaptacaoId.toString();
      const lista = overridesPorAdaptacao.get(chave) ?? [];
      lista.push(override);
      overridesPorAdaptacao.set(chave, lista);
    }
    return adaptacoes.map((adaptacao) => ({
      id: adaptacao._id.toString(),
      erudioEtapaId: etapaPorCardapio.get(adaptacao.cardapioId.toString()) ?? 0,
      prioridade: adaptacao.prioridade,
      restricoesIds: adaptacao.restricoesIds,
      ativo: adaptacao.ativo,
      overrides: (overridesPorAdaptacao.get(adaptacao._id.toString()) ?? []).map((override) => ({
        data: diaIso(override.data),
        refeicao: override.refeicao,
        itens: override.itens.map((item) => ({
          operador: item.operador,
          ativoParaCompra: item.ativoParaCompra,
          fichaTecnicaId: item.fichaTecnicaId,
          alimentoId: item.alimentoId,
          perCapitaBruto: item.perCapitaBruto,
          porcaoServidaGramas: item.porcaoServidaGramas,
        })),
      })),
    }));
  }
}

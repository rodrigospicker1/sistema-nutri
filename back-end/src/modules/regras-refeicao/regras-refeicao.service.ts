import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SalvarMatrizRefeicaoDto } from './dto/salvar-matriz-refeicao.dto.js';
import { RegraRefeicaoTurno, type RegraRefeicaoTurnoDocument } from './schemas/regra-refeicao-turno.schema.js';
import { TipoRefeicao, type TipoRefeicaoDocument } from './schemas/tipo-refeicao.schema.js';

export interface QueryMatrizRefeicao {
  erudioEtapaId?: number;
  erudioTurnoId?: number;
  erudioUnidadeEnsinoId?: number;
}

@Injectable()
export class RegrasRefeicaoService {
  constructor(
    @InjectModel(RegraRefeicaoTurno.name) private readonly regraModel: Model<RegraRefeicaoTurno>,
    @InjectModel(TipoRefeicao.name) private readonly tipoModel: Model<TipoRefeicao>,
  ) {}

  async listarTipos(): Promise<TipoRefeicaoDocument[]> {
    return this.tipoModel.find().sort({ ordem: 1, nome: 1 }).exec();
  }

  async criarTipo(dto: { id: string; nome: string; ordem?: number; ativo?: boolean }): Promise<TipoRefeicaoDocument> {
    const existente = await this.tipoModel.findOne({ id: dto.id }).exec();
    if (existente) throw new BadRequestException(`Tipo de refeição '${dto.id}' já existe`);
    return this.tipoModel.create({
      id: dto.id,
      nome: dto.nome,
      ordem: dto.ordem ?? 0,
      ativo: dto.ativo ?? true,
    });
  }

  async atualizarTipo(id: string, dto: { nome?: string; ordem?: number; ativo?: boolean }): Promise<TipoRefeicaoDocument> {
    const tipo = await this.tipoModel.findOneAndUpdate({ id }, dto, { new: true, runValidators: true }).exec();
    if (!tipo) throw new BadRequestException(`Tipo de refeição '${id}' não encontrado`);
    return tipo;
  }

  async removerTipo(id: string): Promise<{ removido: boolean }> {
    const emUso = await this.regraModel.countDocuments({ refeicaoId: id, ativo: true }).exec();
    if (emUso > 0) {
      throw new BadRequestException(`Tipo de refeição '${id}' está em uso por ${emUso} regra(ões) ativa(s)`);
    }
    const resultado = await this.tipoModel.deleteOne({ id }).exec();
    if (resultado.deletedCount === 0) throw new BadRequestException(`Tipo de refeição '${id}' não encontrado`);
    return { removido: true };
  }

  async listarRegras(query: QueryMatrizRefeicao): Promise<RegraRefeicaoTurnoDocument[]> {
    const filter: Record<string, unknown> = {};
    if (query.erudioEtapaId !== undefined) filter.erudioEtapaId = query.erudioEtapaId;
    if (query.erudioTurnoId !== undefined) filter.erudioTurnoId = query.erudioTurnoId;
    if (query.erudioUnidadeEnsinoId !== undefined) filter.erudioUnidadeEnsinoId = query.erudioUnidadeEnsinoId;
    return this.regraModel.find(filter).sort({ erudioEtapaId: 1, erudioTurnoId: 1, refeicaoId: 1 }).exec();
  }

  /**
   * Substitui a matriz de um bloco (etapa+turno+unidade opcional) pelas refeições enviadas.
   * Refeições ausentes da lista são removidas; presentes são upserted.
   */
  async salvarMatriz(dto: SalvarMatrizRefeicaoDto): Promise<{ atualizadas: number }> {
    const tipos = await this.tipoModel.find({ id: { $in: dto.regras.flatMap((r) => r.refeicaoIds) } }).exec();
    const idsValidos = new Set(tipos.map((t) => t.id));
    for (const regra of dto.regras) {
      const invalidas = regra.refeicaoIds.filter((id) => !idsValidos.has(id));
      if (invalidas.length > 0) {
        throw new BadRequestException(`Refeições desconhecidas: ${invalidas.join(', ')}`);
      }
    }

    const blocos = new Map<string, SalvarMatrizRefeicaoDto['regras']>();
    for (const regra of dto.regras) {
      const chave = `${regra.erudioEtapaId}|${regra.erudioTurnoId}|${regra.erudioUnidadeEnsinoId ?? 'null'}`;
      const lista = blocos.get(chave) ?? [];
      lista.push(regra);
      blocos.set(chave, lista);
    }

    let atualizadas = 0;
    for (const itens of blocos.values()) {
      const primeiro = itens[0];
      const unidade = primeiro.erudioUnidadeEnsinoId ?? null;
      const refeicaoIds = [...new Set(itens.flatMap((i) => i.refeicaoIds))];
      const ativo = itens.every((i) => i.ativo !== false);

      await this.regraModel.deleteMany({
        erudioEtapaId: primeiro.erudioEtapaId,
        erudioTurnoId: primeiro.erudioTurnoId,
        erudioUnidadeEnsinoId: unidade,
      });

      if (refeicaoIds.length > 0) {
        await this.regraModel.insertMany(
          refeicaoIds.map((refeicaoId) => ({
            erudioEtapaId: primeiro.erudioEtapaId,
            erudioTurnoId: primeiro.erudioTurnoId,
            refeicaoId,
            erudioUnidadeEnsinoId: unidade,
            ativo,
          })),
        );
      }
      atualizadas += refeicaoIds.length;
    }
    return { atualizadas };
  }
}

export type { RegraRefeicaoTurnoDocument, TipoRefeicaoDocument };
export { RegraRefeicaoTurno, TipoRefeicao };

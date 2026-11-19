import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfiguracaoGeral } from './schemas/configuracao-geral.schema.js';
import { ConfiguracaoUnidadeEnsino } from './schemas/configuracao-unidade-ensino.schema.js';
import type { SalvarAlmocoContraturnoDto } from './dto/salvar-almoco-contraturno.dto.js';

export const CHAVE_PADRAO_ALMOCO_CONTRATURNO = 'ALOCACAO_ALMOCO_CONTRATURNO';
export const PADRAO_ALMOCO_CONTRATURNO_DEFAULT = 'TURNO_MATUTINO' as const;

export interface ParametrosAlmocoContraturno {
  alocacaoAlmocoContraturnoPadrao: 'TURNO_MATUTINO' | 'TURNO_VESPERTINO';
  unidades: Array<{ erudioUnidadeEnsinoId: number; nomeEscola?: string; ofereceAlmocoContraturno: boolean }>;
}

@Injectable()
export class ConfiguracoesService {
  constructor(
    @InjectModel(ConfiguracaoUnidadeEnsino.name) private readonly unidadeModel: Model<ConfiguracaoUnidadeEnsino>,
    @InjectModel(ConfiguracaoGeral.name) private readonly geralModel: Model<ConfiguracaoGeral>,
  ) {}

  async obterParametrosAlmocoContraturno(): Promise<ParametrosAlmocoContraturno> {
    const [unidades, padrao] = await Promise.all([
      this.unidadeModel.find().exec(),
      this.geralModel.findOne({ chave: CHAVE_PADRAO_ALMOCO_CONTRATURNO }).exec(),
    ]);
    const valor = padrao?.valor;
    return {
      alocacaoAlmocoContraturnoPadrao: valor === 'TURNO_VESPERTINO' ? 'TURNO_VESPERTINO' : PADRAO_ALMOCO_CONTRATURNO_DEFAULT,
      unidades: unidades.map((unidade) => ({
        erudioUnidadeEnsinoId: unidade.erudioUnidadeEnsinoId,
        nomeEscola: unidade.nomeEscola,
        ofereceAlmocoContraturno: unidade.ofereceAlmocoContraturno,
      })),
    };
  }

  async salvarAlmocoContraturno(dto: SalvarAlmocoContraturnoDto): Promise<ParametrosAlmocoContraturno> {
    await this.geralModel.updateOne(
      { chave: CHAVE_PADRAO_ALMOCO_CONTRATURNO },
      {
        $set: {
          valor: dto.alocacaoAlmocoContraturnoPadrao,
          descricao: 'Desempate do almoço do aluno em contraturno quando ambas as unidades oferecem',
        },
      },
      { upsert: true },
    );
    const recebidas = new Set(dto.unidades.map((unidade) => unidade.erudioUnidadeEnsinoId));
    await this.unidadeModel.deleteMany({ erudioUnidadeEnsinoId: { $nin: [...recebidas] } }).exec();
    await Promise.all(
      dto.unidades.map((unidade) =>
        this.unidadeModel.updateOne(
          { erudioUnidadeEnsinoId: unidade.erudioUnidadeEnsinoId },
          { $set: { nomeEscola: unidade.nomeEscola, ofereceAlmocoContraturno: unidade.ofereceAlmocoContraturno } },
          { upsert: true },
        ),
      ),
    );
    return this.obterParametrosAlmocoContraturno();
  }
}

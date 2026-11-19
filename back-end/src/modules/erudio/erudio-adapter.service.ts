import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DemandaEscolar } from '../listas-compras/schemas/demanda-escolar.schema.js';
import { MatriculaEscolar } from '../listas-compras/schemas/matricula-escolar.schema.js';
import type { MatriculaCalculo } from '../listas-compras/calcular-romaneio.js';

export interface AlunosAtivosEscola {
  erudioUnidadeEnsinoId: number;
  erudioEtapaId: number;
  erudioTurnoId?: number;
  nomeEscola: string;
  alunosAtivos: number;
}

/** Lê o snapshot local `demandas_escolares`/`matriculas_escolares`. Consulta ao legado passa por `IErudioProvider`. */
@Injectable()
export class ErudioAdapterService {
  constructor(
    @InjectModel(DemandaEscolar.name) private readonly demandaModel: Model<DemandaEscolar>,
    @InjectModel(MatriculaEscolar.name) private readonly matriculaModel: Model<MatriculaEscolar>,
  ) {}

  async alunosAtivosPorEtapa(erudioEtapaIds: number[]): Promise<AlunosAtivosEscola[]> {
    if (erudioEtapaIds.length === 0) return [];
    const demandas = await this.demandaModel.find({ erudioEtapaId: { $in: erudioEtapaIds } }).exec();
    return demandas.map((demanda) => ({
      erudioUnidadeEnsinoId: demanda.erudioUnidadeEnsinoId,
      erudioEtapaId: demanda.erudioEtapaId,
      erudioTurnoId: demanda.erudioTurnoId,
      nomeEscola: demanda.nomeEscola,
      alunosAtivos: demanda.alunosAtivos,
    }));
  }

  /** Matrículas granulares ativas (`CURSANDO`), base da regra de contraturno. */
  async matriculasPorEtapa(erudioEtapaIds: number[]): Promise<MatriculaCalculo[]> {
    if (erudioEtapaIds.length === 0) return [];
    const matriculas = await this.matriculaModel
      .find({ erudioEtapaId: { $in: erudioEtapaIds }, situacao: 'CURSANDO' })
      .exec();
    return matriculas.map((matricula) => ({
      erudioEnturmacaoId: matricula.erudioEnturmacaoId,
      erudioMatriculaId: matricula.erudioMatriculaId,
      erudioAlunoId: matricula.erudioAlunoId,
      erudioUnidadeEnsinoId: matricula.erudioUnidadeEnsinoId,
      nomeEscola: matricula.nomeEscola,
      erudioEtapaId: matricula.erudioEtapaId,
      erudioTurnoId: matricula.erudioTurnoId,
      dataEfetivacao: matricula.dataEfetivacao,
      dataEncerramento: matricula.dataEncerramento,
    }));
  }
}

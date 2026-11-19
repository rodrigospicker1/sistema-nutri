import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MatriculaEscolarDocument = HydratedDocument<MatriculaEscolar>;

/**
 * Snapshot granular de matrículas ativas (espelho do `listarMatriculas` do
 * `IErudioProvider`). É a base para detectar contraturno: o mesmo
 * `erudioAlunoId` pode ter vínculos em unidades/turnos diferentes.
 */
@Schema({ collection: 'matriculas_escolares' })
export class MatriculaEscolar {
  /** `edu_enturmacao.id` — vínculo temporal na turma. */
  @Prop({ type: Number })
  erudioEnturmacaoId?: number;

  @Prop({ type: Number, required: true })
  erudioMatriculaId: number;

  /** `edu_matricula.aluno_id` — chave que agrupa os vínculos do contraturno. */
  @Prop({ type: Number, required: true })
  erudioAlunoId: number;

  @Prop({ type: Number, required: true })
  erudioUnidadeEnsinoId: number;

  @Prop({ type: String, required: true, trim: true })
  nomeEscola: string;

  @Prop({ type: Number, required: true })
  erudioEtapaId: number;

  @Prop({ type: Number, required: true })
  erudioTurnoId: number;

  /** `edu_enturmacao.data_efetivacao` — início da vigência do vínculo. */
  @Prop({ type: Date })
  dataEfetivacao?: Date;

  /** `edu_enturmacao.data_encerramento` — fim da vigência; nulo = vigente. */
  @Prop({ type: Date, default: null })
  dataEncerramento?: Date | null;

  @Prop({ type: String, default: 'CURSANDO', trim: true })
  situacao: string;
}

export const MatriculaEscolarSchema = SchemaFactory.createForClass(MatriculaEscolar);

MatriculaEscolarSchema.index({ erudioMatriculaId: 1 }, { unique: true });
MatriculaEscolarSchema.index({ erudioAlunoId: 1, erudioEtapaId: 1 });
MatriculaEscolarSchema.index({ erudioUnidadeEnsinoId: 1, erudioEtapaId: 1, erudioTurnoId: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { StatusAlimentacaoEspecial } from '../../../common/enums/index.js';

export type AlimentacaoEspecialDocument = HydratedDocument<AlimentacaoEspecial>;

@Schema({ collection: 'alimentacoes_especiais' })
export class AlimentacaoEspecial {
  @Prop({ type: Number, required: true })
  erudioMatriculaId: number;

  @Prop({ type: Number, required: true })
  erudioUnidadeEnsinoId: number;

  @Prop({ type: Number, required: true })
  erudioEtapaId: number;

  /** `edu_matricula.aluno_id` — chave da pessoa; agrupa laudos do contraturno. */
  @Prop({ type: Number })
  erudioAlunoId?: number;

  /** Restrições do laudo (ids de `tipos_restricao`) — base do perfil de adaptação. */
  @Prop({ type: [String], default: [] })
  restricaoIds: string[];

  @Prop({ type: String, required: true, enum: StatusAlimentacaoEspecial })
  status: StatusAlimentacaoEspecial;

  @Prop({ type: [String], default: [] })
  alimentosNaoUtilizadosIds: string[];

  @Prop({ type: [String], default: [] })
  alimentosUtilizadosIds: string[];
}

export const AlimentacaoEspecialSchema = SchemaFactory.createForClass(AlimentacaoEspecial);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RegraRefeicaoTurnoDocument = HydratedDocument<RegraRefeicaoTurno>;

/**
 * Matriz refeição × etapa × turno. `erudioUnidadeEnsinoId` nulo = regra geral;
 * preenchido = exceção para uma escola específica (precede a regra geral).
 */
@Schema({ collection: 'regras_refeicao_turno' })
export class RegraRefeicaoTurno {
  @Prop({ type: Number, required: true })
  erudioEtapaId: number;

  @Prop({ type: Number, required: true })
  erudioTurnoId: number;

  @Prop({ type: String, required: true, trim: true })
  refeicaoId: string;

  @Prop({ type: Number, default: null })
  erudioUnidadeEnsinoId: number | null;

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const RegraRefeicaoTurnoSchema = SchemaFactory.createForClass(RegraRefeicaoTurno);

RegraRefeicaoTurnoSchema.index(
  { erudioEtapaId: 1, erudioTurnoId: 1, refeicaoId: 1, erudioUnidadeEnsinoId: 1 },
  { unique: true },
);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DemandaEscolarDocument = HydratedDocument<DemandaEscolar>;

@Schema({ collection: 'demandas_escolares' })
export class DemandaEscolar {
  @Prop({ type: Number, required: true })
  erudioUnidadeEnsinoId: number;

  @Prop({ type: Number, required: true })
  erudioEtapaId: number;

  @Prop({ type: Number })
  erudioTurnoId?: number;

  @Prop({ type: String, required: true, trim: true })
  nomeEscola: string;

  @Prop({ type: Number, required: true, min: 0 })
  alunosAtivos: number;
}

export const DemandaEscolarSchema = SchemaFactory.createForClass(DemandaEscolar);

DemandaEscolarSchema.index({ erudioUnidadeEnsinoId: 1, erudioEtapaId: 1, erudioTurnoId: 1 }, { unique: true });

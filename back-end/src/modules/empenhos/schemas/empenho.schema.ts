import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ItemEmpenho, ItemEmpenhoSchema } from './item-empenho.schema.js';

export type EmpenhoDocument = HydratedDocument<Empenho>;

@Schema({ collection: 'empenhos' })
export class Empenho {
  @Prop({ type: Types.ObjectId, ref: 'ContratoHorti', required: true, index: true })
  contratoHortiId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  numeroEmpenho: string;

  @Prop({ type: String, required: true, trim: true })
  fonteRecurso: string;

  @Prop({ type: Date, required: true })
  dataInicio: Date;

  @Prop({ type: Date, required: true })
  dataFim: Date;

  @Prop({ type: [ItemEmpenhoSchema], required: true })
  itensEmpenhados: ItemEmpenho[];

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const EmpenhoSchema = SchemaFactory.createForClass(Empenho);

EmpenhoSchema.index({ contratoHortiId: 1, numeroEmpenho: 1 }, { unique: true });
EmpenhoSchema.index({ contratoHortiId: 1, ativo: 1 });
EmpenhoSchema.index({ ativo: 1, 'itensEmpenhados.alimentoId': 1 });

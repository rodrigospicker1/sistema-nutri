import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TipoEventoContrato, UnidadeMedida } from '../../../common/enums/index.js';

export type ContratoHortiHistoricoDocument = HydratedDocument<ContratoHortiHistorico>;

@Schema({
  collection: 'contratos_horti_historico',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ContratoHortiHistorico {
  @Prop({ type: Types.ObjectId, ref: 'ContratoHorti', required: true, index: true })
  contratoHortiId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: TipoEventoContrato })
  tipoEvento: TipoEventoContrato;

  @Prop({ type: String, required: true, trim: true })
  numeroDocumento: string;

  @Prop({ type: Date, required: true })
  dataVigencia: Date;

  @Prop({ type: Types.ObjectId, ref: 'Alimento' })
  alimentoId?: Types.ObjectId;

  @Prop({ type: String, enum: UnidadeMedida })
  unidadeMedida?: UnidadeMedida;

  @Prop({ type: Number, min: 0 })
  valorAnterior?: number;

  @Prop({ type: Number, min: 0 })
  valorNovo?: number;

  @Prop({ type: Number, min: 0 })
  qtdAnterior?: number;

  @Prop({ type: Number, min: 0 })
  qtdNova?: number;

  @Prop({ type: String, required: true, trim: true })
  motivo: string;

  @Prop({ type: String, required: true, trim: true })
  autorUsuarioId: string;

  createdAt: Date;
}

export const ContratoHortiHistoricoSchema = SchemaFactory.createForClass(ContratoHortiHistorico);

function bloquearMutacao(): never {
  throw new Error('ContratoHortiHistorico é imutável');
}

for (const gancho of [
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'replaceOne',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
] as const) {
  ContratoHortiHistoricoSchema.pre(gancho, bloquearMutacao);
}

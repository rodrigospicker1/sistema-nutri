import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReferenciaNutricionalPnaeDocument = HydratedDocument<ReferenciaNutricionalPnae>;

@Schema({ collection: 'referencias_nutricionais_pnae' })
export class ReferenciaNutricionalPnae {
  @Prop({ type: Types.ObjectId, required: true })
  agrupamentoCardapioId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  descricaoFaixa: string;

  @Prop({ type: Number, required: true, min: 0 })
  kcalMin: number;

  @Prop({ type: Number, required: true, min: 0 })
  kcalMax: number;

  @Prop({ type: Number, required: true, min: 0 })
  proteinaMin: number;

  @Prop({ type: Number, required: true, min: 0 })
  proteinaMax: number;

  @Prop({ type: Number, required: true, min: 0 })
  lipidiosMin: number;

  @Prop({ type: Number, required: true, min: 0 })
  lipidiosMax: number;

  @Prop({ type: Number, required: true, min: 0 })
  carboidratosMin: number;

  @Prop({ type: Number, required: true, min: 0 })
  carboidratosMax: number;

  @Prop({ type: Number, required: true, min: 0 })
  calcioMin: number;

  @Prop({ type: Number, required: true, min: 0 })
  calcioMax: number;

  @Prop({ type: Number, required: true, min: 0 })
  ferroMin: number;

  @Prop({ type: Number, required: true, min: 0 })
  ferroMax: number;

  @Prop({ type: Number, required: true, min: 0 })
  vitaminaAMin: number;

  @Prop({ type: Number, required: true, min: 0 })
  vitaminaAMax: number;

  @Prop({ type: Number, required: true, min: 0 })
  vitaminaCMin: number;

  @Prop({ type: Number, required: true, min: 0 })
  vitaminaCMax: number;

  @Prop({ type: Number, required: true, min: 0 })
  sodioMin: number;

  @Prop({ type: Number, required: true, min: 0 })
  sodioMax: number;

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const ReferenciaNutricionalPnaeSchema = SchemaFactory.createForClass(ReferenciaNutricionalPnae);

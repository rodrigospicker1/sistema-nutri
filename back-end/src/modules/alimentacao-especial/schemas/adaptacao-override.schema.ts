import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OperadorItemRefeicao } from '../../../common/enums/index.js';
import { AdaptacaoCardapio } from './adaptacao-cardapio.schema.js';

export type AdaptacaoOverrideDocument = HydratedDocument<AdaptacaoOverride>;

@Schema({ _id: false })
export class ItemOverride {
  @Prop({ type: String, enum: OperadorItemRefeicao, default: null })
  operador: OperadorItemRefeicao | null;

  @Prop({ type: Boolean, default: true })
  ativoParaCompra: boolean;

  @Prop({ type: String })
  fichaTecnicaId?: string;

  @Prop({ type: String })
  alimentoId?: string;

  @Prop({ type: Number })
  perCapitaBruto?: number;

  @Prop({ type: Number, min: 0 })
  porcaoServidaGramas?: number;
}

const ItemOverrideSchema = SchemaFactory.createForClass(ItemOverride);

/**
 * Delta de um perfil de adaptação: substitui a refeição inteira de um dia
 * específico. Sem registro aqui, o perfil herda o cardápio principal.
 */
@Schema({ collection: 'adaptacao_overrides' })
export class AdaptacaoOverride {
  @Prop({ type: Types.ObjectId, ref: AdaptacaoCardapio.name, required: true })
  adaptacaoId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  data: Date;

  @Prop({ type: String, required: true, trim: true })
  refeicao: string;

  @Prop({ type: [ItemOverrideSchema], default: [] })
  itens: ItemOverride[];
}

export const AdaptacaoOverrideSchema = SchemaFactory.createForClass(AdaptacaoOverride);

AdaptacaoOverrideSchema.index({ adaptacaoId: 1, data: 1, refeicao: 1 }, { unique: true });

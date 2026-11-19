import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Cardapio } from '../../cardapios/schemas/cardapio.schema.js';

export type AdaptacaoCardapioDocument = HydratedDocument<AdaptacaoCardapio>;

/**
 * Perfil de adaptação de um cardápio principal: herda 100% das refeições e
 * guarda apenas os overrides (delta). `restricoesIds` permite a junção de
 * várias restrições no mesmo perfil (ex.: APLV + intolerância à lactose).
 * `prioridade` menor vence quando um aluno cai em mais de um perfil.
 */
@Schema({ collection: 'adaptacoes_cardapio' })
export class AdaptacaoCardapio {
  @Prop({ type: Types.ObjectId, ref: Cardapio.name, required: true })
  cardapioId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  nome: string;

  @Prop({ type: Number, required: true, default: 1 })
  prioridade: number;

  @Prop({ type: [String], default: [] })
  restricoesIds: string[];

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const AdaptacaoCardapioSchema = SchemaFactory.createForClass(AdaptacaoCardapio);

AdaptacaoCardapioSchema.index({ cardapioId: 1, ativo: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AgrupamentoCardapioDocument = HydratedDocument<AgrupamentoCardapio>;

@Schema({ collection: 'agrupamentos_cardapio' })
export class AgrupamentoCardapio {
  @Prop({ type: String, required: true, trim: true })
  nome: string;

  @Prop({ type: String, required: true, trim: true })
  sigla: string;

  @Prop({ type: [Number], default: [] })
  erudioEtapaIds: number[];

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const AgrupamentoCardapioSchema = SchemaFactory.createForClass(AgrupamentoCardapio);

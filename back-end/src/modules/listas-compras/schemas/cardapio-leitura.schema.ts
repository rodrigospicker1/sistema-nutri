import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { StatusCardapio, TipoCardapio, TipoDiaCardapio } from '../../../common/enums/index.js';

@Schema({ _id: false })
export class EmpenhoIngredienteLeitura {
  @Prop({ type: String, required: true })
  alimentoId: string;

  @Prop({ type: String, required: true })
  empenhoId: string;
}

@Schema({ _id: false })
export class ItemRefeicaoLeitura {
  @Prop({ type: String, default: null })
  operador: 'E' | 'OU' | null;

  @Prop({ type: Boolean, default: true })
  ativoParaCompra: boolean;

  @Prop({ type: String })
  fichaTecnicaId?: string;

  @Prop({ type: String })
  alimentoId?: string;

  @Prop({ type: Number })
  perCapitaBruto?: number;

  @Prop({ type: Number })
  perCapitaLiquido?: number;

  @Prop({ type: Number, min: 0 })
  porcaoServidaGramas?: number;

  @Prop({ type: String })
  empenhoId?: string;

  @Prop({ type: [SchemaFactory.createForClass(EmpenhoIngredienteLeitura)], default: [] })
  empenhosIngredientes: EmpenhoIngredienteLeitura[];
}

const ItemRefeicaoLeituraSchema = SchemaFactory.createForClass(ItemRefeicaoLeitura);

@Schema({ _id: false })
export class RefeicaoLeitura {
  @Prop({ type: String, required: true })
  refeicao: string;

  @Prop({ type: [ItemRefeicaoLeituraSchema], default: [] })
  itens: ItemRefeicaoLeitura[];
}

const RefeicaoLeituraSchema = SchemaFactory.createForClass(RefeicaoLeitura);

@Schema({ _id: false })
export class DiaCardapioLeitura {
  @Prop({ type: Date })
  data?: Date;

  @Prop({ type: String, required: true, enum: TipoDiaCardapio })
  tipoDia: TipoDiaCardapio;

  @Prop({ type: Number })
  numeroSemana?: number;

  @Prop({ type: Number, required: true })
  erudioEtapaId: number;

  @Prop({ type: [RefeicaoLeituraSchema], default: [] })
  refeicoes: RefeicaoLeitura[];
}

const DiaCardapioLeituraSchema = SchemaFactory.createForClass(DiaCardapioLeitura);

export type CardapioLeituraDocument = HydratedDocument<CardapioLeitura>;

@Schema({ collection: 'cardapios' })
export class CardapioLeitura {
  @Prop({ type: String, required: true, enum: TipoCardapio })
  tipo: TipoCardapio;

  @Prop({ type: String, required: true, enum: StatusCardapio })
  status: StatusCardapio;

  @Prop({ type: Number, required: true })
  erudioEtapaId: number;

  @Prop({ type: Types.ObjectId })
  agrupamentoCardapioId?: Types.ObjectId;

  @Prop({ type: [DiaCardapioLeituraSchema], default: [] })
  dias: DiaCardapioLeitura[];
}

export const CardapioLeituraSchema = SchemaFactory.createForClass(CardapioLeitura);

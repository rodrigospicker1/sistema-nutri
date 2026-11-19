import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OperadorItemRefeicao, StatusCardapio, TipoCardapio, TipoDiaCardapio } from '../../../common/enums/index.js';

@Schema({ _id: false })
export class EmpenhoIngredienteCardapio {
  @Prop({ type: String, required: true })
  alimentoId: string;

  @Prop({ type: String, required: true })
  empenhoId: string;
}

const EmpenhoIngredienteCardapioSchema = SchemaFactory.createForClass(EmpenhoIngredienteCardapio);

@Schema({ _id: false })
export class ItemCardapio {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true, enum: ['FICHA', 'ALIMENTO'] })
  origem: 'FICHA' | 'ALIMENTO';

  @Prop({ type: String, enum: OperadorItemRefeicao, default: null })
  operador: OperadorItemRefeicao | null;

  @Prop({ type: Boolean, default: true })
  ativoParaCompra: boolean;

  @Prop({ type: String })
  fichaTecnicaId?: string;

  @Prop({ type: String })
  alimentoId?: string;

  @Prop({ type: Number })
  perCapitaLiquido?: number;

  @Prop({ type: Number })
  perCapitaBruto?: number;

  /**
   * Peso PRONTO servido ao aluno quando o item é uma ficha técnica
   * (receita-base). O fator de escala é `porcaoServidaGramas /
   * ficha.rendimentoTotalGramas`. Omitido = 1 porção inteira da receita-base.
   */
  @Prop({ type: Number, min: 0 })
  porcaoServidaGramas?: number;

  @Prop({ type: String })
  empenhoId?: string;

  @Prop({ type: [EmpenhoIngredienteCardapioSchema], default: [] })
  empenhosIngredientes: EmpenhoIngredienteCardapio[];
}

const ItemCardapioSchema = SchemaFactory.createForClass(ItemCardapio);

@Schema({ _id: false })
export class RefeicaoCardapio {
  @Prop({ type: String, required: true })
  refeicao: string;

  @Prop({ type: [ItemCardapioSchema], default: [] })
  itens: ItemCardapio[];
}

const RefeicaoCardapioSchema = SchemaFactory.createForClass(RefeicaoCardapio);

@Schema({ _id: false })
export class DiaCardapio {
  @Prop({ type: Date })
  data?: Date;

  @Prop({ type: String, required: true, enum: TipoDiaCardapio })
  tipoDia: TipoDiaCardapio;

  @Prop({ type: Number, required: true })
  numeroSemana: number;

  @Prop({ type: Number, required: true })
  diaSemana: number;

  @Prop({ type: Number })
  erudioEtapaId?: number;

  @Prop({ type: [RefeicaoCardapioSchema], default: [] })
  refeicoes: RefeicaoCardapio[];
}

const DiaCardapioSchema = SchemaFactory.createForClass(DiaCardapio);

export type CardapioDocument = HydratedDocument<Cardapio>;

@Schema({ collection: 'cardapios' })
export class Cardapio {
  @Prop({ type: String, required: true, trim: true })
  nome: string;

  @Prop({ type: String, required: true, enum: TipoCardapio })
  tipo: TipoCardapio;

  @Prop({ type: String, required: true, enum: StatusCardapio })
  status: StatusCardapio;

  @Prop({ type: Number, required: true })
  erudioEtapaId: number;

  @Prop({ type: Types.ObjectId, ref: 'AgrupamentoCardapio' })
  agrupamentoCardapioId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  refeicoes: string[];

  @Prop({ type: String })
  observacoesCozinha?: string;

  @Prop({ type: [Number], default: [] })
  nutricionistasResponsaveisIds: number[];

  @Prop({ type: Number })
  mes?: number;

  @Prop({ type: Number })
  ano?: number;

  @Prop({ type: [DiaCardapioSchema], default: [] })
  dias: DiaCardapio[];
}

export const CardapioSchema = SchemaFactory.createForClass(Cardapio);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UnidadeMedida } from '../../../common/enums/index.js';
import { PrevisaoMensalEmpenho, PrevisaoMensalEmpenhoSchema } from './previsao-mensal-empenho.schema.js';

@Schema({ _id: false })
export class ItemEmpenho {
  @Prop({ type: Types.ObjectId, ref: 'Alimento', required: true })
  alimentoId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0 })
  qtdEmpenhada: number;

  @Prop({ type: Number, default: 0, min: 0 })
  qtdConsumida: number;

  @Prop({ type: String, required: true, enum: UnidadeMedida })
  unidadeMedida: UnidadeMedida;

  /** Gramas por unidade de compra — herdado do item de contrato (obrigatório p/ MACO/UNIDADE/DUZIA/LITRO). */
  @Prop({ type: Number, default: null, min: 0 })
  gramasPorUnidade: number | null;

  @Prop({ type: Number, required: true, min: 0 })
  valorUnitario: number;

  @Prop({ type: [PrevisaoMensalEmpenhoSchema], default: [] })
  previsaoMensal: PrevisaoMensalEmpenho[];
}

export const ItemEmpenhoSchema = SchemaFactory.createForClass(ItemEmpenho);

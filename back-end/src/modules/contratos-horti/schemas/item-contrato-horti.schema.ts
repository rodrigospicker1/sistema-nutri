import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UnidadeMedida } from '../../../common/enums/index.js';

@Schema({ _id: false })
export class ItemContratoHorti {
  @Prop({ type: Types.ObjectId, ref: 'Alimento', required: true })
  alimentoId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: UnidadeMedida })
  unidadeMedida: UnidadeMedida;

  @Prop({ type: Number, required: true, min: 0 })
  qtdTotalLicitada: number;

  @Prop({ type: Number, required: true, min: 0 })
  valorUnitario: number;

  @Prop({ type: Number, default: null, min: 0 })
  perCapita: number | null;

  @Prop({ type: Number, default: null, min: 0 })
  fatorCorrecao: number | null;

  /**
   * Gramas por unidade de compra quando `unidadeMedida` não é KG/GRAMA
   * (ex.: 1 MACO = 250 g, 1 UNIDADE = 1200 g). Nulo para KG/GRAMA.
   * O empenho herda este valor; divergência é rejeitada.
   */
  @Prop({ type: Number, default: null, min: 0 })
  gramasPorUnidade: number | null;

  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: (dias: number[]) =>
        dias.length > 0 &&
        dias.every((dia) => Number.isInteger(dia) && dia >= 0 && dia <= 6) &&
        new Set(dias).size === dias.length,
      message: 'diasSemanaEntrega deve conter inteiros únicos de 0 a 6',
    },
  })
  diasSemanaEntrega: number[];

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const ItemContratoHortiSchema = SchemaFactory.createForClass(ItemContratoHorti);

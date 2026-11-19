import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ItemContratoHorti, ItemContratoHortiSchema } from './item-contrato-horti.schema.js';

export type ContratoHortiDocument = HydratedDocument<ContratoHorti>;

@Schema({ collection: 'contratos_horti' })
export class ContratoHorti {
  @Prop({ type: String, required: true, trim: true, unique: true })
  numeroContrato: string;

  @Prop({ type: String, required: true, trim: true })
  fornecedorNome: string;

  @Prop({ type: String, required: true, trim: true })
  fornecedorCnpj: string;

  @Prop({ type: Boolean, required: true })
  agriculturaFamiliar: boolean;

  @Prop({ type: Date, required: true })
  vigenciaInicio: Date;

  @Prop({ type: Date, required: true })
  vigenciaFim: Date;

  @Prop({ type: Boolean, required: true })
  arredondamentoTotalAlimentos: boolean;

  @Prop({ type: [ItemContratoHortiSchema], default: [] })
  itens: ItemContratoHorti[];

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const ContratoHortiSchema = SchemaFactory.createForClass(ContratoHorti);

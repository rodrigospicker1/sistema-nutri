import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ListaComprasDocument = HydratedDocument<ListaCompras>;

@Schema({ collection: 'listas_compras', timestamps: { createdAt: true, updatedAt: false } })
export class ListaCompras {
  @Prop({ type: Types.ObjectId, ref: 'ContratoHorti', required: true, index: true })
  contratoHortiId: Types.ObjectId;

  @Prop({ type: [Date], required: true })
  datasConsumo: Date[];

  @Prop({ type: String, required: true, default: 'GERADA' })
  status: 'GERADA';

  @Prop({ type: [String], default: [] })
  datasConsideradas: string[];

  @Prop({ type: [String], default: [] })
  datasIgnoradas: string[];

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  consolidado: unknown[];

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  romaneio: unknown[];

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  alocacoes: unknown[];

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  itensPendentes: unknown[];

  createdAt: Date;
}

export const ListaComprasSchema = SchemaFactory.createForClass(ListaCompras);

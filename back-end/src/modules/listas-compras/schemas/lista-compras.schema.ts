import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ListaComprasDocument = HydratedDocument<ListaCompras>;

/**
 * Ciclo de vida da lista. Apenas `CONFIRMADA` (e `GERADA`, status legado das
 * listas antigas) abate o saldo dos empenhos; `RASCUNHO` é proposta e
 * `CANCELADA` libera o saldo.
 */
export const STATUS_LISTA_COMPRAS = ['RASCUNHO', 'GERADA', 'CONFIRMADA', 'CANCELADA'] as const;
export type StatusListaCompras = (typeof STATUS_LISTA_COMPRAS)[number];
export const STATUS_LISTA_COMPRAS_QUE_ABATEM_SALDO: StatusListaCompras[] = ['GERADA', 'CONFIRMADA'];

@Schema({ collection: 'listas_compras', timestamps: { createdAt: true, updatedAt: false } })
export class ListaCompras {
  /**
   * Contrato principal da lista (retrocompatível). Listas geradas sem contrato
   * pré-selecionado derivam os contratos dos empenhos alocados em
   * `contratoHortiIds` — podem tocar mais de um contrato.
   */
  @Prop({ type: Types.ObjectId, ref: 'ContratoHorti', index: true })
  contratoHortiId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'ContratoHorti', default: [] })
  contratoHortiIds: Types.ObjectId[];

  @Prop({ type: [Date], required: true })
  datasConsumo: Date[];

  /** Escopo do cálculo — vazio/ausente = todas as etapas e unidades. */
  @Prop({ type: [Number], default: [] })
  erudioEtapaIds: number[];

  @Prop({ type: [Number], default: [] })
  erudioUnidadeEnsinoIds: number[];

  @Prop({ type: String, required: true, enum: STATUS_LISTA_COMPRAS, default: 'CONFIRMADA' })
  status: StatusListaCompras;

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

ListaComprasSchema.index({ contratoHortiId: 1, status: 1 });

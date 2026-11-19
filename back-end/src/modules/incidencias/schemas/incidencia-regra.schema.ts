import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PeriodoIncidencia, TipoAlvoIncidencia } from '../../../common/enums/index.js';

export type IncidenciaRegraDocument = HydratedDocument<IncidenciaRegra>;

@Schema({ collection: 'incidencias_regra' })
export class IncidenciaRegra {
  @Prop({ type: String, default: null })
  contratoTerceirizadaId: string | null;

  @Prop({ type: String, required: true, enum: TipoAlvoIncidencia })
  tipoAlvo: TipoAlvoIncidencia;

  @Prop({ type: Types.ObjectId, default: null })
  grupoIncidenciaId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, default: null })
  fichaTecnicaId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, default: null })
  alimentoId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, required: true })
  agrupamentoCardapioId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: PeriodoIncidencia })
  periodo: PeriodoIncidencia;

  @Prop({ type: Number, default: null, min: 0 })
  frequenciaMinima: number | null;

  @Prop({ type: Number, default: null, min: 0 })
  frequenciaMaxima: number | null;

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const IncidenciaRegraSchema = SchemaFactory.createForClass(IncidenciaRegra);

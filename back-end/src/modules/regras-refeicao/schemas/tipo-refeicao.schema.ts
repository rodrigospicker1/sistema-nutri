import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TipoRefeicaoDocument = HydratedDocument<TipoRefeicao>;

@Schema({ collection: 'tipos_refeicao' })
export class TipoRefeicao {
  /** Código estável usado nos cardápios (ex.: LANCHE_MANHA_1). */
  @Prop({ type: String, required: true, unique: true, trim: true })
  id: string;

  @Prop({ type: String, required: true, trim: true })
  nome: string;

  @Prop({ type: Number, required: true, default: 0 })
  ordem: number;

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const TipoRefeicaoSchema = SchemaFactory.createForClass(TipoRefeicao);

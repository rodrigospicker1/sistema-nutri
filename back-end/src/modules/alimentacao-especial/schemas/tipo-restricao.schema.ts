import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TipoRestricaoDocument = HydratedDocument<TipoRestricao>;

/** Catálogo de restrições alimentares (APLV, Celíaco, Diabetes...). */
@Schema({ collection: 'tipos_restricao' })
export class TipoRestricao {
  @Prop({ type: String, required: true, unique: true, trim: true })
  id: string;

  @Prop({ type: String, required: true, trim: true })
  nome: string;

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const TipoRestricaoSchema = SchemaFactory.createForClass(TipoRestricao);

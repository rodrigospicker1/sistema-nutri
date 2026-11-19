import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NivelRestricaoFnde } from '../../../common/enums/index.js';

@Schema({ _id: false })
export class RestricaoEtapaFnde {
  @Prop({ type: Number, required: true })
  erudioEtapaId: number;

  @Prop({ type: String, required: true, enum: NivelRestricaoFnde })
  nivel: NivelRestricaoFnde;

  @Prop({ type: String, required: false, trim: true })
  observacao?: string;
}

export const RestricaoEtapaFndeSchema = SchemaFactory.createForClass(RestricaoEtapaFnde);

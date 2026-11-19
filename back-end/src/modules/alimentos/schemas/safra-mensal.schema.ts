import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StatusSafra } from '../../../common/enums/index.js';

@Schema({ _id: false })
export class SafraMensal {
  @Prop({ type: Number, required: true, min: 1, max: 12 })
  mes: number;

  @Prop({ type: String, required: true, enum: StatusSafra })
  status: StatusSafra;
}

export const SafraMensalSchema = SchemaFactory.createForClass(SafraMensal);

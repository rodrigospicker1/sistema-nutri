import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PrevisaoMensalEmpenho {
  @Prop({ type: Number, required: true, min: 1, max: 12 })
  mes: number;

  @Prop({ type: Number, required: true })
  ano: number;

  @Prop({ type: Number, required: true, min: 0 })
  qtdPrevista: number;
}

export const PrevisaoMensalEmpenhoSchema = SchemaFactory.createForClass(PrevisaoMensalEmpenho);

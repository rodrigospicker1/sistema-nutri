import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ComposicaoNutricional {
  @Prop({ type: Number, default: 0, min: 0 })
  kcal: number;

  @Prop({ type: Number, default: 0, min: 0 })
  proteina: number;

  @Prop({ type: Number, default: 0, min: 0 })
  lipidios: number;

  @Prop({ type: Number, default: 0, min: 0 })
  carboidratos: number;

  @Prop({ type: Number, default: 0, min: 0 })
  fibraAlimentar: number;

  @Prop({ type: Number, default: 0, min: 0 })
  calcio: number;

  @Prop({ type: Number, default: 0, min: 0 })
  ferro: number;

  @Prop({ type: Number, default: 0, min: 0 })
  retinol: number;

  @Prop({ type: Number, default: 0, min: 0 })
  vitaminaC: number;

  @Prop({ type: Number, default: 0, min: 0 })
  sodio: number;

  @Prop({ type: Number, default: 0, min: 0 })
  zinco: number;

  @Prop({ type: Number, default: 0, min: 0 })
  magnesio: number;
}

export const ComposicaoNutricionalSchema = SchemaFactory.createForClass(ComposicaoNutricional);

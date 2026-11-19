import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class IngredienteFichaLeitura {
  @Prop({ type: String, required: true })
  alimentoId: string;

  @Prop({ type: Number, required: true, min: 0 })
  perCapitaBruto: number;
}

const IngredienteFichaLeituraSchema = SchemaFactory.createForClass(IngredienteFichaLeitura);

export type FichaTecnicaLeituraDocument = HydratedDocument<FichaTecnicaLeitura>;

@Schema({ collection: 'fichas_tecnicas' })
export class FichaTecnicaLeitura {
  @Prop({ type: [IngredienteFichaLeituraSchema], default: [] })
  ingredientes: IngredienteFichaLeitura[];
}

export const FichaTecnicaLeituraSchema = SchemaFactory.createForClass(FichaTecnicaLeitura);

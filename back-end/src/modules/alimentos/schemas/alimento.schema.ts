import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CategoriaAlimento, UnidadeMedida } from '../../../common/enums/index.js';
import { ComposicaoNutricional, ComposicaoNutricionalSchema } from './composicao-nutricional.schema.js';
import { RestricaoEtapaFnde, RestricaoEtapaFndeSchema } from './restricao-etapa-fnde.schema.js';
import { SafraMensal, SafraMensalSchema } from './safra-mensal.schema.js';

export type AlimentoDocument = HydratedDocument<Alimento>;

@Schema({ collection: 'alimentos' })
export class Alimento {
  @Prop({ type: String, required: true, trim: true })
  nome: string;

  @Prop({ type: String, required: true, enum: CategoriaAlimento })
  categoria: CategoriaAlimento;

  @Prop({ type: String, required: true, enum: UnidadeMedida })
  unidadeMedidaPadrao: UnidadeMedida;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'GrupoIncidencia' }], default: [] })
  gruposIncidenciaIds: Types.ObjectId[];

  @Prop({ type: ComposicaoNutricionalSchema, default: () => ({}) })
  composicaoNutricional: ComposicaoNutricional;

  @Prop({ type: [SafraMensalSchema], default: [] })
  safraMensal: SafraMensal[];

  @Prop({ type: [RestricaoEtapaFndeSchema], default: [] })
  restricoesEtapaFnde: RestricaoEtapaFnde[];

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const AlimentoSchema = SchemaFactory.createForClass(Alimento);

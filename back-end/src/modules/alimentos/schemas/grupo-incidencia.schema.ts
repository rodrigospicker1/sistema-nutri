import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CategoriaVisualGrupoIncidencia, OrigemRegraIncidencia } from '../../../common/enums/index.js';

export type GrupoIncidenciaDocument = HydratedDocument<GrupoIncidencia>;

@Schema({ collection: 'grupos_incidencia' })
export class GrupoIncidencia {
  @Prop({ type: String, required: true, trim: true })
  nome: string;

  @Prop({ type: String, required: true, enum: CategoriaVisualGrupoIncidencia, default: CategoriaVisualGrupoIncidencia.OUTROS })
  categoriaVisual: CategoriaVisualGrupoIncidencia;

  @Prop({ type: String, required: true, enum: OrigemRegraIncidencia })
  origemRegra: OrigemRegraIncidencia;

  @Prop({ type: Boolean, default: true })
  ativo: boolean;
}

export const GrupoIncidenciaSchema = SchemaFactory.createForClass(GrupoIncidencia);

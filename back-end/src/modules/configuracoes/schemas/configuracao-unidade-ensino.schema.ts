import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConfiguracaoUnidadeEnsinoDocument = HydratedDocument<ConfiguracaoUnidadeEnsino>;

/**
 * Configuração por unidade escolar, chaveada pelo `erudioUnidadeEnsinoId`
 * (facilita o futuro chaveamento direto com o Erudio).
 *
 * `ofereceAlmocoContraturno`: se a unidade serve o almoço do aluno em
 * contraturno (duas unidades no mesmo dia). Default `true`.
 */
@Schema({ collection: 'configuracoes_unidade_ensino' })
export class ConfiguracaoUnidadeEnsino {
  @Prop({ type: Number, required: true, unique: true })
  erudioUnidadeEnsinoId: number;

  @Prop({ type: String, trim: true })
  nomeEscola?: string;

  @Prop({ type: Boolean, default: true })
  ofereceAlmocoContraturno: boolean;
}

export const ConfiguracaoUnidadeEnsinoSchema = SchemaFactory.createForClass(ConfiguracaoUnidadeEnsino);

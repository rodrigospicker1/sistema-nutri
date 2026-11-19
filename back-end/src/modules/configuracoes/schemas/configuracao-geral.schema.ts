import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConfiguracaoGeralDocument = HydratedDocument<ConfiguracaoGeral>;

/**
 * Parâmetros gerais do sistema (singleton por `chave`).
 *
 * `ALOCACAO_ALMOCO_CONTRATURNO`: desempate quando as duas unidades do aluno
 * em contraturno oferecem almoço. Valores: `TURNO_MATUTINO` (default) ou
 * `TURNO_VESPERTINO` — o almoço é contabilizado na unidade onde o aluno
 * cursa o turno correspondente.
 */
@Schema({ collection: 'configuracoes_gerais' })
export class ConfiguracaoGeral {
  @Prop({ type: String, required: true, unique: true, trim: true })
  chave: string;

  @Prop({ type: String, required: true, trim: true })
  valor: string;

  @Prop({ type: String, trim: true })
  descricao?: string;
}

export const ConfiguracaoGeralSchema = SchemaFactory.createForClass(ConfiguracaoGeral);

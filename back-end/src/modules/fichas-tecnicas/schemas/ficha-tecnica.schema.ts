import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** Nutrientes da receita-base (ou por 100 g prontos) — campos por 100 g de referência. */
@Schema({ _id: false })
export class NutrientesFicha {
  @Prop({ type: Number, default: 0 })
  energiaKcal: number;

  @Prop({ type: Number, default: 0 })
  energiaKj: number;

  @Prop({ type: Number, default: 0 })
  proteinasG: number;

  @Prop({ type: Number, default: 0 })
  lipidiosG: number;

  @Prop({ type: Number, default: 0 })
  carboidratosG: number;

  @Prop({ type: Number, default: 0 })
  calcioMg: number;

  @Prop({ type: Number, default: 0 })
  ferroMg: number;

  @Prop({ type: Number, default: 0 })
  retinolMcg: number;

  @Prop({ type: Number, default: 0 })
  vitaminaCMg: number;

  @Prop({ type: Number, default: 0 })
  sodioMg: number;

  @Prop({ type: Number, default: 0 })
  fibrasG: number;
}

const NutrientesFichaSchema = SchemaFactory.createForClass(NutrientesFicha);

@Schema({ _id: false })
export class IngredienteFicha {
  @Prop({ type: String })
  id?: string;

  @Prop({ type: String, required: true })
  alimentoId: string;

  @Prop({ type: Number, required: true, min: 0 })
  perCapitaBruto: number;

  @Prop({ type: Number, min: 0 })
  perCapitaLiquido?: number;

  /**
   * Fator de correção bruto ÷ líquido deste ingrediente. Editável; quando
   * informado junto de `perCapitaLiquido`, o service deriva
   * `perCapitaBruto = perCapitaLiquido × fatorCorrecao`.
   */
  @Prop({ type: Number, min: 0 })
  fatorCorrecao?: number;
}

const IngredienteFichaSchema = SchemaFactory.createForClass(IngredienteFicha);

@Schema({ _id: false })
export class PorcaoEtapaFicha {
  @Prop({ type: Number, required: true })
  erudioEtapaId: number;

  @Prop({ type: Number, required: true, min: 0 })
  quantidadeGramas: number;
}

const PorcaoEtapaFichaSchema = SchemaFactory.createForClass(PorcaoEtapaFicha);

export type FichaTecnicaDocument = HydratedDocument<FichaTecnica>;

@Schema({ collection: 'fichas_tecnicas' })
export class FichaTecnica {
  @Prop({ type: String, trim: true })
  nome?: string;

  @Prop({ type: String })
  modoPreparo?: string;

  /**
   * Rendimento pronto da receita-base em gramas — DERIVADO:
   * `totalLiquidoGramas × fatorCoccao`. Não é editável.
   */
  @Prop({ type: Number, min: 0 })
  rendimentoTotalGramas?: number;

  @Prop({ type: Number, min: 0 })
  fatorCoccao?: number;

  /** Soma das quantidades líquidas dos ingredientes (base TACO). */
  @Prop({ type: Number, min: 0 })
  totalLiquidoGramas?: number;

  /** Soma dos pesos de compra (brutos) dos ingredientes. */
  @Prop({ type: Number, min: 0 })
  totalBrutoGramas?: number;

  /** Totais nutricionais da receita-base inteira. */
  @Prop({ type: NutrientesFichaSchema, default: () => ({}) })
  nutrientesTotaisReceita: NutrientesFicha;

  /** Nutrientes por 100 g de produto pronto (`totais / rendimento × 100`). */
  @Prop({ type: NutrientesFichaSchema, default: () => ({}) })
  nutrientesPor100gPronto: NutrientesFicha;

  @Prop({ type: [IngredienteFichaSchema], default: [] })
  ingredientes: IngredienteFicha[];

  @Prop({ type: [PorcaoEtapaFichaSchema], default: [] })
  porcoesEtapa: PorcaoEtapaFicha[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'GrupoIncidencia' }], default: [] })
  gruposIncidenciaIds: Types.ObjectId[];
}

export const FichaTecnicaSchema = SchemaFactory.createForClass(FichaTecnica);

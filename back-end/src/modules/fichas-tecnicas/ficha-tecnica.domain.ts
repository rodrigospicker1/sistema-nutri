/**
 * Domínio de pesos e nutrientes da ficha técnica — ver docs/PESOS_E_UNIDADES.md.
 *
 * A ficha é uma RECEITA-BASE escalável (ex.: rendimento para 1000 g de arroz
 * cru). Três grandezas distintas que NÃO devem ser confundidas:
 *
 * - `perCapitaLiquido`: quantidade base TACO do ingrediente na receita-base
 *   (g/ml após higienização, antes da cocção). Base da análise nutricional.
 * - `perCapitaBruto`: peso de COMPRA na receita-base —
 *   `perCapitaLiquido × fatorCorrecao` do ingrediente/contrato.
 * - `fatorCoccao` / `rendimentoTotalGramas`: coeficiente de preparo — ganho ou
 *   perda de água no cozimento. `rendimentoTotalGramas` é DERIVADO
 *   (`totalLiquido × fatorCoccao`), nunca editado manualmente.
 *
 * `fatorCorrecao` (item de contrato/alimento) é outra coisa: bruto ÷ líquido
 * do alimento comprado. Não confundir com `fatorCoccao`.
 */

export interface IngredientePesavel {
  perCapitaBruto?: number;
  perCapitaLiquido?: number;
}

export interface FichaPesavel {
  fatorCoccao?: number;
  ingredientes: IngredientePesavel[];
}

/** Quantidade líquida efetiva do ingrediente (fallback: bruto quando não há líquido). */
export function quantidadeLiquida(ingrediente: IngredientePesavel): number {
  return ingrediente.perCapitaLiquido ?? ingrediente.perCapitaBruto ?? 0;
}

/** Peso de compra (bruto) do ingrediente na receita-base. */
export function pesoBrutoCompra(ingrediente: IngredientePesavel): number {
  return ingrediente.perCapitaBruto ?? ingrediente.perCapitaLiquido ?? 0;
}

/** Base líquida da receita-base: soma das quantidades líquidas dos ingredientes. */
export function baseLiquidaFicha(ficha: FichaPesavel): number {
  return ficha.ingredientes.reduce((soma, ingrediente) => soma + quantidadeLiquida(ingrediente), 0);
}

/** Peso de compra total da receita-base: soma dos pesos brutos. */
export function totalBrutoFicha(ficha: FichaPesavel): number {
  return ficha.ingredientes.reduce((soma, ingrediente) => soma + pesoBrutoCompra(ingrediente), 0);
}

/**
 * Rendimento pronto (peso servido) da receita-base:
 * `totalLiquido × fatorCoccao`. Retorna null sem fator válido ou base vazia.
 */
export function rendimentoPronto(ficha: FichaPesavel): number | null {
  const fator = ficha.fatorCoccao;
  if (fator === undefined || fator <= 0) return null;
  const base = baseLiquidaFicha(ficha);
  if (base <= 0) return null;
  return Math.round(base * fator * 10) / 10;
}

/** Campos nutricionais por 100 g do alimento (espelha `ComposicaoNutricional`). */
export interface Nutrientes100g {
  energiaKcal: number;
  energiaKj: number;
  proteinasG: number;
  lipidiosG: number;
  carboidratosG: number;
  calcioMg: number;
  ferroMg: number;
  retinolMcg: number;
  vitaminaCMg: number;
  sodioMg: number;
  fibrasG: number;
}

/** Totais nutricionais da receita-base inteira. */
export type NutrientesTotais = Nutrientes100g;

/** Nutrientes por 100 g de produto pronto. */
export type NutrientesPor100gPronto = Nutrientes100g;

const CAMPOS_NUTRIENTES = [
  'energiaKcal',
  'energiaKj',
  'proteinasG',
  'lipidiosG',
  'carboidratosG',
  'calcioMg',
  'ferroMg',
  'retinolMcg',
  'vitaminaCMg',
  'sodioMg',
  'fibrasG',
] as const;

export type CampoNutriente = (typeof CAMPOS_NUTRIENTES)[number];

/** Mapeia `ComposicaoNutricional` do alimento (por 100 g) para `Nutrientes100g`. */
export function nutrientesDoAlimento(comp?: {
  kcal?: number;
  proteina?: number;
  lipidios?: number;
  carboidratos?: number;
  fibraAlimentar?: number;
  calcio?: number;
  ferro?: number;
  retinol?: number;
  vitaminaC?: number;
  sodio?: number;
} | null): Nutrientes100g {
  const kcal = comp?.kcal ?? 0;
  return {
    energiaKcal: kcal,
    energiaKj: Math.round(kcal * 4.184 * 100) / 100,
    proteinasG: comp?.proteina ?? 0,
    lipidiosG: comp?.lipidios ?? 0,
    carboidratosG: comp?.carboidratos ?? 0,
    calcioMg: comp?.calcio ?? 0,
    ferroMg: comp?.ferro ?? 0,
    retinolMcg: comp?.retinol ?? 0,
    vitaminaCMg: comp?.vitaminaC ?? 0,
    sodioMg: comp?.sodio ?? 0,
    fibrasG: comp?.fibraAlimentar ?? 0,
  };
}

/**
 * Totais nutricionais da receita-base:
 * `Σ (quantidadeLiquida / 100) × nutriente100g` por campo.
 * `alimentoPorId` resolve `ingrediente.alimentoId` → nutrientes por 100 g.
 */
export function nutrientesTotaisReceita(
  ingredientes: Array<IngredientePesavel & { alimentoId?: string }>,
  alimentoPorId: Map<string, Nutrientes100g>,
): NutrientesTotais {
  const totais = {} as NutrientesTotais;
  for (const campo of CAMPOS_NUTRIENTES) totais[campo] = 0;
  for (const ingrediente of ingredientes) {
    const nutrientes = ingrediente.alimentoId ? alimentoPorId.get(ingrediente.alimentoId) : undefined;
    if (!nutrientes) continue;
    const fator = quantidadeLiquida(ingrediente) / 100;
    for (const campo of CAMPOS_NUTRIENTES) totais[campo] += nutrientes[campo] * fator;
  }
  for (const campo of CAMPOS_NUTRIENTES) totais[campo] = Math.round(totais[campo] * 100) / 100;
  return totais;
}

/**
 * Nutrientes por 100 g de produto PRONTO:
 * `totais[campo] / rendimentoTotalGramas × 100`, arredondado em 2 casas.
 * Retorna null sem rendimento positivo.
 */
export function nutrientesPor100gPronto(
  totais: NutrientesTotais,
  rendimentoTotalGramas: number,
): NutrientesPor100gPronto | null {
  if (!rendimentoTotalGramas || rendimentoTotalGramas <= 0) return null;
  const saida = {} as NutrientesPor100gPronto;
  for (const campo of CAMPOS_NUTRIENTES) {
    saida[campo] = Math.round(((totais[campo] / rendimentoTotalGramas) * 100) * 100) / 100;
  }
  return saida;
}

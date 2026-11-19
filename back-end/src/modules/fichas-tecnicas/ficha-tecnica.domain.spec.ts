import {
  baseLiquidaFicha,
  nutrientesDoAlimento,
  nutrientesPor100gPronto,
  nutrientesTotaisReceita,
  pesoBrutoCompra,
  rendimentoPronto,
  totalBrutoFicha,
} from './ficha-tecnica.domain.js';

describe('ficha-tecnica.domain', () => {
  const ficha = {
    fatorCoccao: 0.9,
    ingredientes: [
      { perCapitaBruto: 120, perCapitaLiquido: 100 },
      { perCapitaBruto: 60 }, // sem líquido → fallback bruto
      { perCapitaBruto: 0, perCapitaLiquido: 40 },
    ],
  };

  it('soma a base líquida preferindo perCapitaLiquido e caindo para bruto', () => {
    expect(baseLiquidaFicha(ficha)).toBe(200);
  });

  it('soma o total bruto da receita-base', () => {
    expect(totalBrutoFicha(ficha)).toBe(180);
  });

  it('peso de compra usa perCapitaBruto e cai para líquido quando ausente', () => {
    expect(pesoBrutoCompra({ perCapitaBruto: 120, perCapitaLiquido: 100 })).toBe(120);
    expect(pesoBrutoCompra({ perCapitaLiquido: 100 })).toBe(100);
    expect(pesoBrutoCompra({})).toBe(0);
  });

  it('rendimento pronto = base líquida × fatorCoccao', () => {
    // 200 g líquidos × 0.9 = 180 g prontos
    expect(rendimentoPronto(ficha)).toBe(180);
  });

  it('retorna null sem fatorCoccao positivo ou sem base', () => {
    expect(rendimentoPronto({ fatorCoccao: 0, ingredientes: ficha.ingredientes })).toBeNull();
    expect(rendimentoPronto({ fatorCoccao: 1, ingredientes: [] })).toBeNull();
  });
});

describe('ficha-tecnica.domain — nutrientes (exemplo planilha: arroz)', () => {
  // Arroz integral: 1189 g líquido, fatorCoccao 2,20 → 2615,8 g prontos.
  // Composição TACO aproximada do arroz integral cozido/integral usado no teste:
  // kcal 124/100g → totais = 1189/100 × 124 = 1474,36 kcal → /2615,8 × 100 = 56,36 kcal/100g.
  const arroz = nutrientesDoAlimento({ kcal: 124, proteina: 2.6, fibraAlimentar: 2.7 });

  it('mapeia composição nutricional para campos da ficha', () => {
    expect(arroz.energiaKcal).toBe(124);
    expect(arroz.energiaKj).toBeCloseTo(518.82, 1);
    expect(arroz.proteinasG).toBe(2.6);
    expect(arroz.fibrasG).toBe(2.7);
  });

  it('calcula nutrientesTotaisReceita = Σ (líquido/100) × nutriente100g', () => {
    const totais = nutrientesTotaisReceita(
      [
        { alimentoId: 'arroz', perCapitaLiquido: 1189 },
        { alimentoId: 'oleo', perCapitaLiquido: 11 }, // óleo sem composição → contribui 0
      ],
      new Map([['arroz', arroz]]),
    );
    expect(totais.energiaKcal).toBeCloseTo(1474.36, 2);
    expect(totais.proteinasG).toBeCloseTo(30.91, 2);
    expect(totais.fibrasG).toBeCloseTo(32.1, 2);
  });

  it('calcula nutrientesPor100gPronto = totais / rendimento × 100', () => {
    const totais = nutrientesTotaisReceita([{ alimentoId: 'arroz', perCapitaLiquido: 1189 }], new Map([['arroz', arroz]]));
    const por100g = nutrientesPor100gPronto(totais, 2615.8);
    expect(por100g?.energiaKcal).toBeCloseTo(56.36, 2);
    expect(por100g?.proteinasG).toBeCloseTo(1.18, 2);
  });

  it('retorna null para nutrientesPor100gPronto sem rendimento válido', () => {
    const totais = nutrientesTotaisReceita([], new Map());
    expect(nutrientesPor100gPronto(totais, 0)).toBeNull();
  });
});

# Pesos, fatores e unidades — Cardápio × Ficha Técnica × Contrato/Empenho × Lista de Compras

Documento de domínio sobre as grandezas de peso usadas em cada etapa do fluxo
de merenda. Os três fatores abaixo são **conceitualmente diferentes** e não
devem ser misturados — confundi-los gera demanda errada na lista de compras.

## 1. As três grandezas de peso — Ficha como RECEITA-BASE

A ficha técnica é uma **receita-base escalável** (ex.: rendimento de 1000 g de
arroz cru). Os campos `perCapita*` da ficha são quantidades **da receita-base
inteira**, não por aluno — a porção servida escalona no cardápio.

| Grandeza | Onde vive | Significado | Quem consome |
|---|---|---|---|
| `perCapitaLiquido` | `ItemCardapio`, `IngredienteFicha` | Quantidade **líquida** base TACO (após higienização, antes da cocção) | Nutrição; base do rendimento e dos totais da receita |
| `perCapitaBruto` | `ItemCardapio`, `IngredienteFicha` | Peso de **compra** = `perCapitaLiquido × fatorCorrecao` | **Romaneio de compras** |
| `fatorCoccao` / `rendimentoTotalGramas` | `FichaTecnica` | Coeficiente de **preparo**; `rendimentoTotalGramas = totalLiquido × fatorCoccao` (derivado) | Cardápio (porção servida); **NÃO** entra no cálculo de compra |

### Campos derivados persistidos na ficha (recalculados a cada save)

- `totalLiquidoGramas` = Σ `perCapitaLiquido` (fallback: bruto)
- `totalBrutoGramas` = Σ `perCapitaBruto`
- `rendimentoTotalGramas` = `totalLiquidoGramas × fatorCoccao`
- `nutrientesTotaisReceita[campo]` = Σ `(perCapitaLiquido/100) × nutriente100g`
  para `energiaKcal`, `energiaKj`, `proteinasG`, `lipidiosG`, `carboidratosG`,
  `calcioMg`, `ferroMg`, `retinolMcg`, `vitaminaCMg`, `sodioMg`, `fibrasG`
  (fonte: `Alimento.composicaoNutricional`)
- `nutrientesPor100gPronto[campo]` = `totais[campo] / rendimento × 100`

### Escala por porção servida (cardápio → romaneio)

Quando um item de cardápio referencia uma ficha (`fichaTecnicaId`) e informa
`porcaoServidaGramas` (peso pronto servido ao aluno):

```
fatorEscalaPorAluno = porcaoServidaGramas / ficha.rendimentoTotalGramas
consumoBrutoPorAluno = ingrediente.perCapitaBruto × fatorEscalaPorAluno
nutrientesDaRefeicao  = (porcaoServidaGramas / 100) × nutrientesPor100gPronto
```

`porcaoServidaGramas` omitido → escala 1 (receita-base inteira). O mesmo vale
para overrides de alimentação especial.

### Precedência do peso de compra no romaneio

`perCapitaCompra()` em `calcular-romaneio.ts` resolve o bruto per capita
nesta ordem:

1. **`perCapitaLiquido` presente + `fatorCorrecao` > 0 no item de contrato** →
   deriva `líquido × fatorCorrecao`. O líquido é a base TACO e o fator é o do
   alimento **licitado** — fonte de verdade, imune a bruto desatualizado.
2. Sem um dos dois → `perCapitaBruto` gravado no cardápio/ficha (legado/manual).
3. Sem nenhum → `perCapitaLiquido` (aproximação) ou 0.

Aplica-se a itens avulsos, ingredientes de ficha técnica e overrides de
alimentação especial — todos passam pelo mesmo resolvedor. Para ingredientes
de ficha, o resultado ainda é multiplicado pelo `fatorEscalaPorAluno`.

- **`fatorCorrecao`** (item de contrato): bruto ÷ líquido do **alimento
  comprado** (ex.: banana 1,35; batata 1,15). Converte demanda per capita em
  unidade de compra.
- **`fatorCoccao`** (ficha técnica): coeficiente de preparo (arroz ~2,1; feijão
  ~2,5; carne ~0,8). Define quanto o prato rende depois de cozido.

### Regras invioláveis

1. **Romaneio/lista de compras opera exclusivamente sobre peso cru**
   (`perCapitaBruto`). `fatorCoccao` e `rendimentoTotalGramas` **nunca** são
   aplicados no cálculo de compra/empenho — documentado em JSDoc no topo de
   `calcular-romaneio.ts`.
2. **`perCapitaLiquido` nunca é alterado** pelo cálculo de rendimento — ele é
   a base nutricional e permanece gravado como informado.
3. **`rendimentoTotalGramas`** é **derivado, não editável**: peso pronto
   servido = `Σ perCapitaLiquido × fatorCoccao`
   (`ficha-tecnica.domain.ts`). O backend sempre recalcula no save e o front
   exibe o valor calculado em campo somente-leitura; o `fatorCoccao` é o
   único input. Sem base líquida/fator válidos, preserva-se o valor legado.

## 2. Unidades de medida e `gramasPorUnidade`

`UnidadeMedida`: `KG`, `GRAMA`, `DUZIA`, `MACO`, `UNIDADE`, `LITRO`.

O cardápio calcula em **gramas**. O empenho pode ser licitado em unidade de
compra não-mássica (1 maço de cheiro-verde = 250 g; 1 unidade de abacaxi =
1200 g). Para converter demanda em gramas → unidade de compra:

- `KG` → `gramas / 1000`
- `GRAMA` → `gramas`
- `MACO` / `UNIDADE` / `DUZIA` / `LITRO` → `gramas / gramasPorUnidade`

`gramasPorUnidade` é definido **no item de contrato** (fonte de verdade) e
**herdado pelo item de empenho**:

- Empenho omite `unidadeMedida` → herda a do contrato.
- Empenho omite `gramasPorUnidade` → herda a do contrato.
- Empenho informa valor divergente → `BadRequestException` na criação/atualização
  (`EmpenhosService.validarItens`).
- Item de contrato com unidade não-mássica **sem** `gramasPorUnidade` → o motor
  não consegue converter; trate como pendência de cadastro.

### Trava defensiva no romaneio

`calcularRomaneio` chama `assertUnidadesEmpenhoContrato` antes de qualquer
cálculo: para cada item de empenho ativo vinculado a um item de contrato
ativo do mesmo alimento, `unidadeMedida` e `gramasPorUnidade` devem coincidir.
Divergência **aborta** o cálculo com erro descritivo (empenho, contrato,
alimento) — nunca gera lista com unidades incompatíveis.

## 3. Onde cada coisa é aplicada

| Etapa | Usa |
|---|---|
| Ficha técnica (save) | `totalLiquido`, `totalBruto`, `rendimento = líquido × fatorCoccao`, `nutrientesTotaisReceita`, `nutrientesPor100gPronto` — tudo recalculado |
| Cardápio / ficha (porção servida) | `porcaoServidaGramas / rendimentoTotalGramas` = fator de escala; nutrientes da refeição = `(porção/100) × nutrientesPor100gPronto` |
| Nutrição (TACO) | `perCapitaLiquido` |
| Lista de compras / empenho | `perCapitaCompra` × `fatorEscalaPorAluno` (fichas) → `paraUnidade(unidadeMedida, gramasPorUnidade)` |

Arquivos-chave:

- `back-end/src/modules/fichas-tecnicas/ficha-tecnica.domain.ts` — fórmulas de rendimento.
- `back-end/src/modules/fichas-tecnicas/fichas-tecnicas.service.ts` — sugestão de `rendimentoTotalGramas`.
- `back-end/src/modules/contratos-horti/schemas/item-contrato-horti.schema.ts` — `fatorCorrecao`, `gramasPorUnidade`.
- `back-end/src/modules/empenhos/empenhos.service.ts` — herança/validação de unidade e conversão.
- `back-end/src/modules/listas-compras/calcular-romaneio.ts` — JSDoc de domínio, `paraUnidade`, `assertUnidadesEmpenhoContrato`.

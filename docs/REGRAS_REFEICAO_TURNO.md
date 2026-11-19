# Regra de Negócio — Refeições por Turno e Etapa

## Status da implementação

- ✅ Schemas `tipos_refeicao` e `regras_refeicao_turno` em
  `back-end/src/modules/regras-refeicao/schemas/`
- ✅ DTO `salvar-matriz-refeicao.dto.ts`
- ✅ Service + Controller + Module `regras-refeicao.*.ts` — endpoints
  `GET/POST/PATCH/DELETE /tipos-refeicao`, `GET /regras-refeicao`,
  `PUT /regras-refeicao/lote`; módulo registrado em `app.module.ts` e importado por
  `ListasComprasModule` (que injeta `RegrasRefeicaoService`)
- ✅ `erudio-adapter.service.ts` retorna `erudioTurnoId` (campo opcional em
  `demandas_escolares`)
- ✅ Seed (`back-end/scripts/seed.ts`) popula `tipos_refeicao` a partir de `REFEICOES`
  e limpa `regras_refeicao_turno`
- ✅ Frontend: `app/pages/regras-refeicao.vue` — matriz etapa × turno com checkboxes,
  filtro por unidade (regra geral × exceção), CRUD simples de tipos; funções em
  `app/composables/useNutricao.ts` (`tiposRefeicao`, `regrasRefeicao`,
  `salvarTipoRefeicao`, `removerTipoRefeicao`, `salvarMatrizRefeicao`)
- ✅ Verificação: `npm run build` e `npm run lint` no back-end

## Contraturno (adição posterior)

A matriz etapa × turno continua sendo a base das refeições de cada vínculo.
Sobre ela, a regra de contraturno (`docs/REGRAS_CONTRATURNO_ALMOCO.md`) remove
o `ALMOCO` dos vínculos de alunos em 2 unidades e o realoca uma única vez
conforme `ofereceAlmocoContraturno` por unidade + desempate
`ALOCACAO_ALMOCO_CONTRATURNO`. No caminho granular (`matriculas_escolares`),
as linhas de demanda já chegam por `refeicaoId`, então a matriz é aplicada na
montagem das linhas (`montarDemandasGranulares`), não no loop principal.

## Contexto

Um cardápio é planejado por **etapa** (`erudioEtapaId`) e contém todas as refeições do dia
(Lanche da Manhã, Almoço, Lanche da Tarde, Jantar etc.). Porém a demanda de alunos vem do
Erúdio **por turno** (`erudioTurnoId`): alunos de turnos diferentes na mesma etapa não
comem as mesmas refeições.

Exemplo: 1º Ano (`erudioEtapaId: 1`) — Turno 1 (Matutino) come apenas Lanche da Manhã;
Turno 2 (Vespertino) come apenas Lanche da Tarde. O cardápio continua completo, mas a
contagem de insumos deve somar cada turno **somente** nas refeições permitidas para ele.

## Regra

Para cada bloco `(erudioEtapaId, erudioTurnoId)` da demanda:

1. Consultar a matriz `regras_refeicao_turno` para obter as refeições permitidas.
2. Se existir regra específica com `erudioUnidadeEnsinoId`, ela tem precedência sobre a
   regra geral da etapa/turno.
3. Somar `totalAlunosAtivos` do bloco **apenas** nas porções do cardápio cuja refeição
   está na lista permitida. Refeições fora da lista são ignoradas para aquele grupo.
4. Se não houver nenhuma regra cadastrada para o bloco, o comportamento atual é mantido
   (todas as refeições contam) — retrocompatibilidade.

## Modelo de dados (MongoDB / Mongoose — não há Prisma neste projeto)

### `tipos_refeicao` (collection)

| Campo      | Tipo   | Obs                          |
| ---------- | ------ | ---------------------------- |
| `id`       | string | ex: `LANCHE_MANHA_1`         |
| `nome`     | string | ex: `Lanche da manhã 1`      |
| `ordem`    | number | ordenação na grade           |
| `ativo`    | bool   | default `true`               |

Seed inicial a partir da constante `REFEICOES` (front-end `src/types/nutricao.ts` /
backend enum equivalente): `LANCHE_MANHA_1`, `LANCHE_MANHA_2`, `ALMOCO`,
`LANCHE_TARDE`, `JANTAR`, `CEIA`.

### `regras_refeicao_turno` (collection)

| Campo                  | Tipo   | Obs                                        |
| ---------------------- | ------ | ------------------------------------------ |
| `erudioEtapaId`        | number | obrigatório                                |
| `erudioTurnoId`        | number | obrigatório                                |
| `refeicaoId`           | string | ref `tipos_refeicao.id`                    |
| `erudioUnidadeEnsinoId`| number | opcional — exceção por escola              |
| `ativo`                | bool   | default `true`                             |

Índice único: `{ erudioEtapaId, erudioTurnoId, refeicaoId, erudioUnidadeEnsinoId }`
(o campo de unidade usa `null` quando ausente).

### `demandas_escolares` (alteração)

Adicionar `erudioTurnoId: number` (**opcional** — demandas sem turno mantêm o
comportamento antigo) e ajustar o índice único para
`{ erudioUnidadeEnsinoId, erudioEtapaId, erudioTurnoId }`.

## Backend (NestJS)

### Novo módulo `regras-refeicao`

- `GET /regras-refeicao` — lista a matriz (filtros: `erudioEtapaId`, `erudioTurnoId`,
  `erudioUnidadeEnsinoId`).
- `PUT /regras-refeicao/lote` — salva em lote as refeições permitidas por etapa/turno
  (recebe array de `{ erudioEtapaId, erudioTurnoId, erudioUnidadeEnsinoId?, refeicaoIds[] }`).
- `GET /tipos-refeicao` / `POST /tipos-refeicao` — CRUD do catálogo de refeições.

### Motor de cálculo — `listas-compras/calcular-romaneio.ts`

Hoje a informação de refeição se perde em dois pontos:

1. `listas-compras.service.ts` monta `dias[].refeicoes` sem o nome da refeição
   (`{ itens }` apenas). Passar a incluir `refeicao: refeicao.refeicao`.
2. `calcular-romaneio.ts` gera `porcoes` sem `refeicaoId`. Adicionar `refeicaoId` à
   interface `Porcao` e propagar na montagem.

Mudanças de contrato:

- `DiaConsumoCalculo.refeicoes`: `Array<{ refeicao: string; itens: ItemRefeicaoCalculo[] }>`
- `Porcao`: + `refeicaoId: string`
- `DemandaCalculo`: + `erudioTurnoId: number`
- `EntradaRomaneio`: + `regrasRefeicao: RegraRefeicaoCalculo[]`
  (`{ erudioEtapaId, erudioTurnoId, erudioUnidadeEnsinoId?, refeicaoId }`)

No loop de demandas (`calcularRomaneio`), para cada demanda `(unidade, etapa, turno)`:

- Resolver o conjunto de `refeicaoId` permitidos (regra da unidade > regra geral).
- Filtrar `porcoesEtapa` por `refeicaoId` antes de multiplicar por `alunosAtivos`.
- Sem regra cadastrada → comportamento atual (todas as refeições).

`ErudioAdapterService.alunosAtivosPorEtapa` passa a retornar também `erudioTurnoId`
(lendo o novo campo de `demandas_escolares`).

## Frontend (Nuxt, mesmo repositório)

- Nova tela/seção de configuração (ex.: `app/pages/regras-refeicao.vue` ou modal em
  cardápios): matriz **etapa × turno** com checkboxes das refeições, salvando em lote
  via `PUT /regras-refeicao/lote`.
- Listar `tipos_refeicao` como colunas fixas (ou CRUD simples se necessário).

## Pontos de atenção

- Cardápios existentes não mudam — a regra só afeta o cálculo de demanda/insumos.
- `alimentacao_especial` (substituições) continua operando por etapa; revisar se a
  substituição deve respeitar o turno do aluno no futuro.
- Seed (`back-end/scripts/seed.ts`) e `front-end/src/mocks/nutricao.mock.ts`
  (`demandasEscolares`) precisam do campo `erudioTurnoId`.

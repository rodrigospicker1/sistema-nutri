# Fluxo da Lista de Compras e Romaneio

Documento de referência do pipeline que liga o planejamento nutricional (cardápios,
fichas técnicas, alimentação especial) à execução financeira (contrato de hortifruti →
empenhos → rateio → saldo). O motor é `back-end/src/modules/listas-compras/calcular-romaneio.ts`;
a persistência fica em `ListaCompras` e o saldo concorrente em `EmpenhosService.saldoConcorrente`.

## Visão geral

```
Cardápio PRONTO (dias letivos)
  → demandas granulares por escola/etapa/refeição (matrículas Erudio + contraturno)
  → explosão de fichas técnicas e itens avulsos em gramas de peso de compra
  → conversão para a unidade comercial do item de contrato
  → consolidação por alimento + candidatos de empenho
  → rateio (manual ou sugerido) + pendências de saldo
  → lista persistida (RASCUNHO → CONFIRMADA | CANCELADA)
  → romaneio de entrega por escola
```

## Etapa 1 — Escopo e filtro de dias

- Entrada: `POST /listas-compras/simular|gerar` com `datasConsumo[]` e escopo
  opcional `erudioEtapaIds` / `erudioUnidadeEnsinoIds`. `contratoHortiId` é
  **opcional**: sem ele, a lista é dirigida pela demanda e os itens de **todos**
  os contratos ativos viram candidatos — o contrato de cada alimento é definido
  pelo empenho efetivamente alocado (`ListaCompras.contratoHortiIds` guarda os
  contratos tocados; `contratoHortiId` guarda o primeiro, p/ retrocompat).
- O motor só considera datas que existem como dia de cardápio `MENSAL`/`PRONTO`.
- Dias `FERIADO`, `REUNIAO_PEDAGOGICA` e `RECESSO` são ignorados por inteiro
  (`TIPOS_DIA_SEM_CONSUMO`) e listados em `datasIgnoradas`.
- **Escopo**: etapas filtram os dias de cardápio; unidades filtram demandas e
  matrículas. O consolidado e o romaneio refletem apenas as escolas/etapas
  selecionadas (vazio = tudo). Filtrar unidades pode quebrar pares de contraturno
  — a outra unidade some do cálculo.
- Com `contratoHortiId`, contrato inativo/inexistente → `404`. Itens de contrato
  inativos não geram demanda (vale para todos os contratos quando o campo é omitido).

## Etapa 2 — Contagem granular de alunos (Erudio)

Quando `matriculas` está presente (espelho de `edu_enturmacao`/`edu_turma`), o cálculo é
por vínculo e por dia D:

- **Vigência defensiva**: só entram vínculos com `dataEfetivacao <= D` e
  (`dataEncerramento` nula ou `> D`) — no dia exato do encerramento a unidade antiga
  já não conta, evitando duplicidade em transferências.
- **Desempate de mesmo turno**: duas enturmações do mesmo aluno no mesmo turno no dia D
  → fica a de `dataEfetivacao` mais recente.
- **Contraturno**: mesmo `erudioAlunoId`, no mesmo dia, em 2+ unidades cobrindo turno
  matutino (1) e vespertino (2). Os lanches contam em cada unidade do turno; o almoço
  é contado **uma única vez**, na unidade definida por `ofereceAlmocoContraturno` +
  `alocacaoAlmocoContraturnoPadrao` (`TURNO_MATUTINO`/`TURNO_VESPERTINO`). Se nenhuma
  unidade oferece, o contraturno não tem almoço.
- **Matriz de refeições**: `regrasRefeicao` (etapa × turno × unidade) filtra quais
  refeições do cardápio cada vínculo consome. Sem regra cadastrada, o vínculo herda
  todas as refeições da etapa. Turno integral (4) consome todas as refeições do dia.
- Sem `matriculas`, cai no modo agregado por `demandas` (escola × etapa × alunosAtivos),
  retrocompatível.

## Etapa 3 — Alimentação especial (perfis de adaptação)

- Laudos `DEFERIDO` são agrupados por `erudioAlunoId`/matrícula → conjunto de
  `restricaoIds` → casa com o `AdaptacaoPerfil` de menor `prioridade` da etapa.
- Sem override para `(data, refeicao)`: o aluno especial **herda** o cardápio principal
  e soma na demanda comum.
- Com override: a linha consome os itens da refeição adaptada (expandida como ficha
  técnica ou alimento avulso) e entra sinalizada via `perfilId`.
- A substituição legada 1:1 (`alimentosNaoUtilizadosIds` → `alimentosUtilizadosIds`
  da mesma categoria) só se aplica a laudos **sem** perfil de adaptação cobrindo as
  restrições; gera `substituicoesAplicadas` no romaneio da escola.

## Etapa 4 — Explosão fichas → gramas → unidade comercial

Domínio: **somente peso de compra (bruto)**. `fatorCoccao`/`rendimentoTotalGramas` da
ficha medem o rendimento pronto e servem apenas para escalar a porção — a compra é
sempre sobre o ingrediente cru.

1. **Escala da ficha**: `porcaoServidaGramas / rendimentoTotalGramas`
   (sem porção informada = receita-base inteira, escala 1).
2. **Per capita de compra**: se a porção tem `perCapitaLiquido` e o item de contrato
   tem `fatorCorrecao > 0` → `líquido × fatorCorrecao`; senão usa `perCapitaBruto`
   gravado (legado/manual).
3. **Quantidade**: `gramas × alunos × escala`, somado por `(escola, etapa, alimento)`.
4. **Conversão** (`paraUnidade`): `KG` ÷1000, `GRAMA` direto, `MACO`/`UNIDADE`/`DUZIA`/`LITRO`
   ÷ `gramasPorUnidade` do item de contrato. `arredondamentoTotalAlimentos` do contrato
   decide entre manter 4 casas ou `ceil` por alimento.
5. **Integridade**: `assertUnidadesEmpenhoContrato` aborta o cálculo se algum empenho
   ativo divergir em `unidadeMedida` ou `gramasPorUnidade` do item licitado.

## Etapa 5 — Consolidação e rateio de empenhos

Por alimento consolidado, o motor monta `candidatos`: empenhos **ativos** que
reservam o alimento (do contrato informado, ou de todos os contratos ativos
quando `contratoHortiId` é omitido — o empenho alocado define o contrato do item), cada um com:

```
saldoDisponivel(empenho, alimento) = qtdEmpenhada − Σ rateios em listas GERADA|CONFIRMADA
```

- **Rateio manual**: `alocacoes[]` do DTO (`{ alimentoId, rateios: [{ empenhoId, quantidade }] }`).
  Rateio acima do saldo → pendência `SEM_SALDO`; rateio para empenho que não cobre o
  alimento → `SEM_EMPENHO`; soma alocada < pedida → `RATEIO_INSUFICIENTE`.
- **Rateio sugerido**: alimento sem rateio manual recebe sugestão automática —
  ordena candidatos por `dataFim` ascendente (empenho que vence primeiro consome
  primeiro; desempate `numeroEmpenho`) e distribui a demanda esgotando o saldo de cada
  um. O item sai com `rateioSugerido: true` para o front exibir/editar.
- **Déficit**: havendo candidatos, `RATEIO_INSUFICIENTE` é emitido sempre que
  `totalAlocado < quantidadePedida`, com `saldoTotalDisponivel` — alerta de saldo
  insuficiente para acionar aditivo/remanejamento, sem bloquear a geração.
- `alocacoesEfetivas` no resultado consolida todos os rateios aplicados (manuais +
  sugeridos) — é o que o `gerar` persiste em `ListaCompras.alocacoes`.

## Etapa 6 — Fechamento, ciclo de vida e rastreabilidade

### Status da lista

| Status      | Abate saldo? | Significado                                        |
| ----------- | ------------ | -------------------------------------------------- |
| `RASCUNHO`  | não          | proposta; pode ser confirmada ou cancelada        |
| `CONFIRMADA`| sim          | lista fechada; abate o saldo dos empenhos         |
| `CANCELADA` | não          | cancelada; libera o saldo                         |
| `GERADA`    | sim          | status legado das listas antigas — tratado como confirmada |

`POST /listas-compras/gerar` grava `CONFIRMADA` por padrão; `rascunho: true` grava
`RASCUNHO`. O snapshot fica em `consolidado` (quantidadeCalculada/Pedida, candidatos
com saldo, alocacoes com valorUnitario/valorTotal/saldoRestante), `romaneio` por
escola e `itensPendentes` — trilha de auditoria do PNAE.

### Endpoints

| Método | Rota | Função |
| ------ | ---- | ------ |
| POST | `/listas-compras/simular` | calcula romaneio + rateio sugerido, sem gravar (`erudioEtapaIds`, `erudioUnidadeEnsinoIds`) |
| POST | `/listas-compras/gerar` | grava a lista (`rascunho?`) com `alocacoesEfetivas` |
| GET  | `/listas-compras?contratoHortiId&status` | histórico de listas |
| GET  | `/listas-compras/:id` | detalhe |
| PATCH | `/listas-compras/:id/confirmar` | RASCUNHO→CONFIRMADA; **recalcula** o romaneio com os rateios gravados e bloqueia se o saldo não cobrir mais |
| PATCH | `/listas-compras/:id/cancelar` | →CANCELADA, libera saldo |
| GET  | `/empenhos/saldo-disponivel/:contratoHortiId` | quanto ainda cabe **empenhar** por alimento (licitado − empenhado) |
| GET  | `/empenhos/saldo-concorrente` | idem, agregando todos os contratos ativos |
| GET  | `/empenhos/saldo-concorrente/:contratoHortiId` | saldo **concorrente** por empenho: `qtdEmpenhada − qtdAlocada` em listas confirmadas, ordenado por vencimento |

### Romaneio de entrega

`resultado.romaneio` traz, por `(unidadeEnsino, etapa)`: `alunosAtivos`, `itens`
(alimento × quantidade na unidade comercial) e `substituicoesAplicadas` — base para a
programação de entrega por escola e, futuramente, a baixa de recebimento.

## Limitações conhecidas

- `datasConsideradas` conta qualquer data com consumo no cardápio do escopo de
  etapa — filtrar só por unidade pode manter datas cujas escolas ficaram vazias.
- `confirmar` revalida saldo e escopo (etapas/unidades gravadas na lista), mas não
  revalida a composição do cardápio (se o cardápio mudou depois do rascunho, a
  lista confirmada reflete o cálculo da geração).
- `qtdConsumida` no `ItemEmpenho` é legado do protótipo e não é usada — o consumo real
  é derivado das listas confirmadas.

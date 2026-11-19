# Regra de Negócio — Contraturno e Alocação do Almoço

> Base de cálculo crítica: este documento descreve exatamente como a demanda de
> alunos em contraturno (duas unidades escolares no mesmo dia) vira refeições
> e insumos na lista de compras. Qualquer mudança aqui afeta o romaneio, o
> empenho e a entrega por escola.

## Status da implementação

- ✅ Collection `matriculas_escolares` (`matricula-escolar.schema.ts`) — snapshot
  granular de vínculos de enturmação (`edu_enturmacao`/`edu_turma`/`edu_matricula`),
  com `erudioEnturmacaoId`, `erudioAlunoId`, unidade, etapa, turno,
  `dataEfetivacao`, `dataEncerramento` e `situacao`.
- ✅ Collections `configuracoes_unidade_ensino` (flag
  `ofereceAlmocoContraturno`, default `true`) e `configuracoes_gerais`
  (parâmetro `ALOCACAO_ALMOCO_CONTRATURNO` = `TURNO_MATUTINO` | `TURNO_VESPERTINO`,
  default `TURNO_MATUTINO`).
- ✅ Módulo `configuracoes` — endpoints `GET/PUT /configuracoes/almoco-contraturno`.
- ✅ `ErudioAdapterService.matriculasPorEtapa()` lê `matriculas_escolares`
  (`situacao: 'CURSANDO'`).
- ✅ Motor `calcular-romaneio.ts` — função `montarDemandasGranulares()` resolve a
  demanda por refeição quando há matrículas; sem matrículas cai no caminho
  agregado `demandas_escolares` (retrocompatível).
- ✅ Testes em `calcular-romaneio.spec.ts` (`describe 'calcularRomaneio — contraturno'`).
- ✅ Mockup `docs/mocks/matriculas-contraturno.mock.json` (66 vínculos) e recorte
  em `front-end/src/mocks/nutricao.mock.ts` (`matriculasEscolares`,
  `configuracoesAlmocoContraturnoMock`) — ambos semeados por `back-end/scripts/seed.ts`.

## Contexto

A demanda agregada (`demandas_escolares`, um total por unidade/etapa/turno) não
consegue expressar o aluno que frequenta **duas unidades no mesmo dia** — ex.:
matutino na escola A e vespertino na escola B. Para isso existe a collection
`matriculas_escolares`, granular por **vínculo de enturmação**, no formato da
base real do Erudio:

- `edu_enturmacao` → `erudioEnturmacaoId`, `dataEfetivacao`, `dataEncerramento`
- `edu_turma` → `erudioUnidadeEnsinoId`, `erudioEtapaId`, `erudioTurnoId`
- `edu_matricula` → `erudioMatriculaId`, `erudioAlunoId` (chave do contraturno)

Turnos do Erudio (ver `docs/INTEGRACAO_ERUDIO_MOCKS.md`): `1` Matutino,
`2` Vespertino, `3` Noturno, `4` Integral.

## Regra

### 1. Vigência no dia D e detecção de contraturno

A demanda granular é resolvida **por dia de consumo D** (cada data letiva
selecionada do cardápio). Para cada D:

1. **Filtro temporal defensivo**: só entram vínculos com
   `DATE(dataEfetivacao) <= D` e (`dataEncerramento` nula ou
   `DATE(dataEncerramento) > D`). No dia exato do encerramento a unidade
   antiga **já não conta** — evita duplicidade com a unidade destino em
   transferências. Vínculos sem datas (snapshot legado) são sempre ativos.
2. **Desempate de mesmo turno**: se o mesmo `erudioAlunoId` tiver duas
   enturmações ativas em D **no mesmo turno** (inconsistência/troca), fica
   apenas a de `dataEfetivacao` mais recente (desempate final por
   `erudioEnturmacaoId`/`erudioMatriculaId` maior).
3. **Contraturno**: mesmo `erudioAlunoId` com vínculos ativos em D em
   **duas ou mais unidades distintas** cobrindo turno matutino (`1`) **e**
   vespertino (`2`) — ou seja, está matriculado de manhã em uma unidade e à
   tarde em outra. Vínculos duplicados na mesma (unidade, etapa, turno) são
   deduplicados. A dupla matrícula **gera o benefício**: o aluno passa a ter
   direito ao almoço (cardápio completo), além dos lanches de cada turno.

Alunos de turno único (só manhã, só tarde, noturno ou integral) seguem o
comportamento normal: consomem as refeições permitidas pela matriz
`regras_refeicao_turno` do seu (etapa, turno, unidade) — com a exceção do
integral abaixo.

### 2. Lanches do contraturno

Cada vínculo do aluno contraturno gera demanda **na sua própria unidade** para
as refeições permitidas pela matriz etapa/turno/unidade — ou seja, o lanche da
manhã conta na unidade do turno matutino e o lanche da tarde na unidade do
turno vespertino. O `ALMOCO` é **removido** do conjunto de refeições do
vínculo, para nunca ser contado em duplicidade.

### 2a. Turno integral (turno 4)

O aluno de **turno integral** (`erudioTurnoId = 4`) fica o dia inteiro na
escola e consome **todas as refeições da sua etapa naquela unidade** —
independentemente da matriz `regras_refeicao_turno` do turno. Se o aluno
integral também for contraturno (vínculos matutino+vespertino em outras
unidades), o `ALMOCO` é igualmente removido do vínculo integral e realocado
pela regra da seção 3, mantendo a contagem única.

### 3. Alocação do almoço (uma única vez por aluno)

O almoço do contraturno é, por regra geral, servido pela **primeira unidade**
— a que o aluno frequenta no turno matutino. O benefício só existe porque o
aluno está matriculado em **outra unidade no período da tarde**; sem esse
segundo vínculo não há contraturno e não há almoço extra.

A flag `ofereceAlmocoContraturno` de cada unidade decide quem pode servir:

| `ofereceAlmocoContraturno` | Resultado |
| --- | --- |
| Unidade da manhã `true` (e a da tarde `false`) | Almoço na **unidade da manhã**, independentemente de flags da tarde. |
| Unidade da manhã `false`, unidade da tarde `true` | Almoço na **unidade da tarde** — ela assume porque oferece almoço; o lanche da tarde dela já é garantido pelo vínculo vespertino (matriz etapa/turno). |
| Ambas `true` | Desempate `ALOCACAO_ALMOCO_CONTRATURNO`: `TURNO_MATUTINO` (default) → unidade do turno 1; `TURNO_VESPERTINO` → unidade do turno 2. |
| Ambas `false` | **Sem almoço** para o contraturno: não existe segunda unidade elegível que ofereça almoço, então o benefício não se aplica. |

- Unidade sem configuração cadastrada → default `true`.
- O almoço é contabilizado sob a **etapa do vínculo escolhido** na unidade
  vencedora (preferência pelo vínculo do turno do critério de desempate).
- O resultado é sempre **uma** demanda de `ALMOCO` por aluno contraturno —
  garantia de que o almoço nunca é contado em duplicidade.

### 4. Fallback agregado

Se `matriculas_escolares` estiver vazia para as etapas do cardápio, o cálculo
usa `demandas_escolares` como antes (soma `alunosAtivos` por etapa com o filtro
de refeições por turno). As duas fontes **não** são somadas.

## Modelo de dados

### `matriculas_escolares` (collection)

Snapshot dos vínculos de enturmação (`edu_enturmacao` + `edu_turma` +
`edu_matricula`).

| Campo | Tipo | Origem Erudio | Obs |
| --- | --- | --- | --- |
| `erudioEnturmacaoId` | number | `edu_enturmacao.id` | vínculo temporal na turma |
| `erudioMatriculaId` | number | `edu_matricula.id` | matrícula do vínculo |
| `erudioAlunoId` | number | `edu_matricula.aluno_id` | chave que agrupa o contraturno |
| `erudioUnidadeEnsinoId` | number | `edu_turma.unidade_ensino_id` | unidade do vínculo |
| `nomeEscola` | string | — | snapshot do nome |
| `erudioEtapaId` | number | `edu_turma.etapa_id` | etapa do vínculo |
| `erudioTurnoId` | number | `edu_turma.turno_id` | 1 manhã, 2 tarde, 3 noite, 4 integral |
| `dataEfetivacao` | Date | `edu_enturmacao.data_efetivacao` | início da vigência |
| `dataEncerramento` | Date \| null | `edu_enturmacao.data_encerramento` | fim da vigência; nulo = vigente |
| `situacao` | string | — | default `CURSANDO`; só essas entram no cálculo |

Índices: `{ erudioMatriculaId }` único, `{ erudioAlunoId, erudioEtapaId }`,
`{ erudioUnidadeEnsinoId, erudioEtapaId, erudioTurnoId }`.

### `configuracoes_unidade_ensino` (collection)

| Campo | Tipo | Obs |
| --- | --- | --- |
| `erudioUnidadeEnsinoId` | number | único — chave de integração com o Erudio |
| `nomeEscola` | string | opcional |
| `ofereceAlmocoContraturno` | bool | default `true` |

### `configuracoes_gerais` (collection)

Parâmetros singleton por `chave`. Chave `ALOCACAO_ALMOCO_CONTRATURNO`,
valor `TURNO_MATUTINO` (default) ou `TURNO_VESPERTINO`.

## Motor de cálculo

`EntradaRomaneio` ganhou campos opcionais:

- `matriculas?: MatriculaCalculo[]` — vínculos de enturmação (ver tabela acima)
- `configuracoesAlmocoContraturno?: { erudioUnidadeEnsinoId, ofereceAlmocoContraturno }[]`
- `alocacaoAlmocoContraturnoPadrao?: 'TURNO_MATUTINO' | 'TURNO_VESPERTINO'`

`montarDemandasGranulares()` produz linhas
`{ data, unidade, etapa, turno, nomeEscola, refeicaoId | null, alunosAtivos }`:

- `data` = dia de consumo ao qual a demanda se aplica (vínculos avaliados por dia);
- `refeicaoId` preenchido → conta só aquela refeição do cardápio;
- `refeicaoId: null` → todas as refeições da etapa (vínculo sem regra de turno).

`alunosAtivos` do romaneio por (unidade, etapa) passa a ser a contagem de
`erudioAlunoId` distintos com vínculo — não a soma das linhas de refeição.

### Para que serve o detalhamento por escola

O romaneio é consolidado por `(erudioUnidadeEnsinoId, erudioEtapaId)`: cada
linha de `romaneio[].itens` diz **quanto de cada alimento aquela escola deve
receber**. É esse detalhamento que orienta a separação e o envio dos alimentos
na lista de compras — por isso a atribuição correta do almoço (e dos lanches)
por unidade é crítica: uma unidade a mais ou a menos muda a entrega física.

## API

- `GET /configuracoes/almoco-contraturno` — devolve `{ alocacaoAlmocoContraturnoPadrao, unidades[] }`.
- `PUT /configuracoes/almoco-contraturno` — body `{ alocacaoAlmocoContraturnoPadrao, unidades: [{ erudioUnidadeEnsinoId, nomeEscola?, ofereceAlmocoContraturno }] }`; substitui o conjunto de unidades configuradas.

## Pontos de atenção

- **Transferências**: um aluno que muda de unidade no meio do período tem
  demandas diferentes por dia — antes da vigência conta na origem, depois só
  no destino. O `alunosAtivos` do romaneio é a contagem de alunos distintos
  com vínculo ativo em algum dia considerado.
- **Etapas divergentes no par**: o mock real tem contraturno com etapas
  diferentes por vínculo (ex.: aluno 7001 → etapa 16 de manhã, etapa 20 à
  tarde). Cada vínculo conta nas refeições da **sua** etapa; o almoço vai para
  a etapa do vínculo vencedor.
- **Integral (turno 4) e noturno (3)** nunca geram contraturno sozinhos — a
  detecção exige turno 1 **e** 2.
- **`alimentacao_especial`** continua por etapa/unidade, como antes; a
  substituição opera sobre as porções da etapa independente do turno. O fluxo
  completo de perfis de adaptação (herança/override) está em
  `docs/ALIMENTACAO_ESPECIAL.md`.
- Quando o Erudio passar a ser consultado ao vivo, `listarMatriculas()` do
  `IErudioProvider` precisa expor `erudioAlunoId` para alimentar
  `matriculas_escolares` sem perda da detecção de contraturno.

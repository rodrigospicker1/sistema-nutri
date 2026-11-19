# Alimentação Especial — perfis de adaptação (herança + override)

> Fluxo de alunos com restrição alimentar (laudo `DEFERIDO`): catálogo de
> restrições, perfis de adaptação que herdam o cardápio principal e guardam
> apenas o delta (overrides), e o impacto na lista de compras sem duplicidade
> de alunos ou insumos.

## 1. Modelo de dados (implementado — MongoDB/Mongoose)

### `tipos_restricao` — catálogo de restrições

| Campo | Tipo | Obs |
| --- | --- | --- |
| `id` | string | único, ex.: `APLV`, `INTOLERANCIA_LACTOSE`, `DOENCA_CELIACA` |
| `nome` | string | nome de exibição |
| `ativo` | bool | default `true` |

CRUD: `GET/POST /alimentacao-especial/tipos-restricao`,
`PATCH/DELETE /alimentacao-especial/tipos-restricao/:id`.

### `alimentacoes_especiais` — laudo do aluno (estendido)

| Campo | Tipo | Obs |
| --- | --- | --- |
| `erudioMatriculaId` | number | matrícula no Erudio |
| `erudioAlunoId` | number? | `edu_matricula.aluno_id` — vincula o laudo à pessoa (contraturno) |
| `erudioUnidadeEnsinoId` / `erudioEtapaId` | number | escopo do laudo |
| `status` | enum | `EM_ANALISE`, `DEFERIDO`, `INDEFERIDO`, `ENCERRADO` |
| `restricaoIds` | string[] | restrições do catálogo cobertas pelo laudo |
| `alimentosNaoUtilizadosIds` / `alimentosUtilizadosIds` | string[] | **legado** — substituição 1:1 por categoria (mantido como fallback) |

Só laudos `DEFERIDO` entram no cálculo.

### `adaptacoes_cardapio` — perfil de adaptação

| Campo | Tipo | Obs |
| --- | --- | --- |
| `cardapioId` | ObjectId | cardápio principal (`tipo: MENSAL`) — a etapa vem do cardápio |
| `nome` | string | ex.: `Sem leite / APLV` |
| `prioridade` | number | menor vence quando um aluno cai em >1 perfil |
| `restricoesIds` | string[] | **junção**: várias restrições no mesmo perfil |
| `ativo` | bool | default `true` |

### `adaptacao_overrides` — apenas o delta

| Campo | Tipo | Obs |
| --- | --- | --- |
| `adaptacaoId` | ObjectId | ref `adaptacoes_cardapio` |
| `data` | Date | dia do cardápio alterado |
| `refeicao` | string | id da refeição (`tipos_refeicao`) |
| `itens` | array | substitutos no mesmo formato do cardápio: `operador`, `ativoParaCompra`, `fichaTecnicaId` **ou** `alimentoId` + `perCapitaBruto` |

Índice único `{ adaptacaoId, data, refeicao }`. O override substitui a
**refeição inteira** daquele dia para o perfil; sem override → herança total
do cardápio principal (alterações futuras no principal refletem
automaticamente nos dias não adaptados).

## 2. API (`/alimentacao-especial`)

- `GET restricoes-ativas` — restrições com laudos `DEFERIDO` na etapa de um
  cardápio, com contagem de alunos.
- `GET/POST adaptacoes-cardapio`, `PATCH/DELETE adaptacoes-cardapio/:id` —
  CRUD de perfis (criar perfil já vincula `restricoesIds`).
- `PUT adaptacoes-cardapio/:id/overrides` — substitui o conjunto de overrides
  do perfil (upsert por `(data, refeicao)`).
- `GET adaptacoes-cardapio/:id/cardapio` — **cardápio consolidado**: principal
  + overrides mesclados, cada refeição marcada `adaptado: true/false`.

Service: `AlimentacaoEspecialService.adaptacoesParaCalculo(etapaIds)` converte
perfis + overrides em `AdaptacaoCalculo[]` para o motor de romaneio.

## 3. Cálculo na lista de compras (`calcular-romaneio.ts`)

Só atua no **caminho granular** (`matriculas` presentes); sem matrículas o
comportamento agregado legado permanece intacto.

1. **Resolução do perfil por aluno**: laudos `DEFERIDO` viram
   `restricoesPorAluno` (chave `aluno:{erudioAlunoId}`, fallback por
   `erudioMatriculaId`). `perfilPara(etapa, restricoes)` escolhe o perfil de
   menor `prioridade` que contenha qualquer restrição do aluno — um aluno com
   APLV + lactose no mesmo perfil conta **1 vez**; em perfis distintos vale só
   o prioritário (sem dupla contagem).
2. **Por vínculo/dia**: para cada refeição que o vínculo consome, se existir
   override `(adaptacaoId, data=D, refeicao)` a linha leva `perfilId`; caso
   contrário o aluno **herda o principal** e entra na demanda comum — ou seja,
   o "abatimento da turma comum" é implícito: quem tem perfil sem override no
   dia consome exatamente o mesmo item do cardápio principal.
3. **Override**: os itens substitutos são expandidos como porções
   (`fichaTecnicaId` → ingredientes da ficha; `alimentoId` → per capita
   bruto), filtrados pelo contrato/empenho como qualquer item do cardápio, e
   somados na `(unidade, etapa)` do vínculo — inclusive quando **todos** os
   alunos da escola são do perfil.
4. **Interação com contraturno**: o perfil é resolvido por
   `(etapa do vínculo, restrições do aluno)` — o lanche da manhã segue o
   vínculo matutino e o almoço segue a unidade que o alocou; o override de
   `ALMOCO` vale para o aluno de contraturno na unidade que serve o almoço.
5. **Substituição legada** (`alimentosNaoUtilizadosIds` → mesma categoria):
   laudos cuja `restricaoIds` intersecta um perfil ativo **não** passam pela
   substituição 1:1 — são resolvidos por herança/override. Laudos sem
   restrição mapeada continuam no caminho legado.

Testes em `calcular-romaneio.spec.ts` cobrem: junção de restrições no mesmo
perfil sem duplicar aluno, supressão da substituição legada, herança quando
não há override no dia, prioridade entre perfis e override com a escola 100%
especial.

## 4. Pontos de atenção

- **Aluno em múltiplos perfis**: prioridade resolve no cálculo; a tela deve
  alertar quando um `erudioAlunoId` cair em perfis distintos (sugestão:
  criar perfil combinado).
- **Override por refeição inteira**: mais simples e auditável. Troca de item
  isolado dentro de uma ficha pode virar `itemOverrides` no futuro.
- **Vigência do laudo**: hoje o laudo não tem `dataEfetivacao`/
  `dataEncerramento` como as enturmações — restrições encerradas no meio do
  mês ainda valeriam até o status mudar. Evolução natural: espelhar a
  vigência temporal do vínculo.
- **Recálculo nutricional (TACO)**: a grade consolidada já separa herdado ×
  adaptado; o cálculo nutricional deve somar nutrientes do override nos dias
  alterados e herdados nos demais (pendente).
- **Frontend** (`front-end/app/pages/alimentacao-especial.vue` +
  `composables/useAlimentacaoEspecial.ts`): seleção de cardápio mensal →
  restrições ativas da etapa (com alerta de alunos em múltiplas restrições) →
  CRUD de perfis (nome, prioridade, junção de restrições) → grade do cardápio
  consolidado com células herdadas × adaptadas; clique na célula abre o editor
  de override (itens substitutos) ou "Restaurar herdado" (DELETE do override).
  Gerenciamento do catálogo `tipos_restricao` na mesma tela.
  Pendente: destaque de demanda especial na tela da lista de compras.

# Contrato de integração e mocks do Erudio

Fonte do mock: recorte real do banco legado da rede municipal de Itajaí (nov/2026 para matrículas). O Nutri não grava esses cadastros. Guarda o ID numérico e lê escola, etapa, turno, matrícula, calendário e usuário por `IErudioProvider` (back-end) ou `useErudioMock` (front-end).

O prompt antigo da nutrição inventava enums que este banco não tem. O mock abaixo guarda o legado. O adapter traduz para o DTO que cardápio, ficha, FNDE e lista de compras já usam.

| O que o prompt pedia | O que o Erudio tem |
| --- | --- |
| `tipo: 'CEI' \| 'ESCOLA_BASICA'` | `tipo_id` + nome: `1` CENTRO DE EDUCAÇÃO INFANTIL, `4` ESCOLA BÁSICA |
| Etapas 1–7 (Berçário 1 … Fundamental II) | `1`–`9` = 1º ao 9º ano. Infantil é `20`, `21`, `22`, `23`, `17`, `18`, `10` (Jardim I/II e Pré) |
| Turno `MATUTINO` \| `VESPERTINO` \| `INTEGRAL` | `1` Matutino, `2` Vespertino, `3` Noturno, `4` Integral. Modalidade `PARCIAL` ou `INTEGRAL` |
| `tipoEvento` `LETIVO` \| `FERIADO` \| `REUNIAO_PEDAGOGICA` \| `RECESSO` | Coluna `edu_calendario_dia.letivo` (`0`/`1`). Evento: `FERIADO`, `RECESSO`, `ATIVIDADE_ADMINISTRATIVA`, `ATIVIDADE_ESCOLAR` |
| `crn` e perfil `NUTRICIONISTA` | Não existe CRN. Perfil = grupo: `NUTRICIONISTAS`, `Fiscal alimentação`, `Alimentação` |
| `erudioUnidadeEnsinoId` nulo = rede | Calendário é por `instituicao_id`. SME = `16138`. `null` no mock significa essa instituição |

APIs de alimentação que já existem no Erudio: `GET /api/alimentacao/matriculas/quantidade` e a lista em `/matriculas` (teto 800). Calendário e usuários não passam por esse bundle.

## Onde cada ID entra no Nutri

- **Unidade** (`erudioUnidadeEnsinoId`): filtro de agrupamento de cardápio, `detalhamentoUnidades` da lista de compras e `execucao_refeicao_dia`.
- **Etapa e turno** (`erudioEtapaId`, `erudioTurnoId`): `agrupamentoCardapio`, `restricoesEtapaFnde`, `porcoesEtapa` da ficha e `referencia_nutricional_pnae`. No FNDE, infantil é o curso `11`. Fundamental I são as etapas `1`–`5`. Fundamental II são `6`–`9`. A etapa `1` é o 1º ano, não o Berçário.
- **Matrícula**: quantidade agregada multiplica `perCapitaBruto` na lista de compras. O aluno individual cruza com laudo `DEFERIDO` em `alimentacaoEspecial`. O laudo é só do Mongo da nutrição; o Erudio não tem essa tabela.
- **Contraturno**: a lista de compras também lê `matriculas_escolares` (snapshot granular de vínculos de enturmação: `edu_enturmacao` + `edu_turma` + `edu_matricula`, com `erudioAlunoId`, `dataEfetivacao` e `dataEncerramento`) para detectar o mesmo aluno em 2 unidades no mesmo dia e alocar o almoço uma única vez — ver `docs/REGRAS_CONTRATURNO_ALMOCO.md` e o mockup `docs/mocks/matriculas-contraturno.mock.json`. Quando o Erudio for consultado ao vivo, o provider precisa expor os vínculos de enturmação vigentes por data (hoje `listarMatriculas()` devolve `edu_matricula` sem turma nem datas de enturmação).
- **Calendário**: ao clonar cardápio `MODELO` → `MENSAL`, o adapter preenche `cardapio_dia.tipoDia`. Na lista de compras, um dia não letivo daquela unidade zera a entrega da escola na data.
- **Usuário** (`erudioUsuarioId`): rodapé do cardápio (`nutricionistasResponsaveisIds`), `contrato_horti_historico.autorUsuarioId` e o check diário em `execucao_refeicao_dia`. Roles do JWT de alimentação: `ROLE_ALIMENTACAO`, `ROLE_ALIMENTACAO_ADMIN`, `ROLE_ALIMENTACAO_FISCAL`.

## Tradução do adapter

O `IErudioProvider` devolve o DTO da nutrição. Quem implementar a API real preenche o mesmo contrato, sem mudar regra de cardápio ou de compra.

| Legado | DTO da nutrição |
| --- | --- |
| `tipoId === 1` | `tipo: 'CEI'` |
| `tipoId === 4` | `tipo: 'ESCOLA_BASICA'` |
| outro `tipoId` | `tipo: null` (não inventar rótulo) |
| `cursoId === 11` | `faixaFnde: 'EDUCACAO_INFANTIL'` |
| curso `10` e etapa `1`–`5` | `faixaFnde: 'FUNDAMENTAL_I'` |
| curso `10` e etapa `6`–`9` | `faixaFnde: 'FUNDAMENTAL_II'` |
| `letivo === 1` | `ehDiaLetivo: true` e `tipoDiaCardapio: 'LETIVO'` |
| evento `FERIADO` e dia não letivo | `tipoDiaCardapio: 'FERIADO'` |
| evento `RECESSO` e dia não letivo | `tipoDiaCardapio: 'RECESSO'` |
| evento `ATIVIDADE_ADMINISTRATIVA` e dia não letivo | `tipoDiaCardapio: 'REUNIAO_PEDAGOGICA'` |
| evento `ATIVIDADE_ESCOLAR` e dia não letivo | `tipoDiaCardapio: null` (o Nutri não tem esse enum) |
| grupo `NUTRICIONISTAS` | `perfil: 'NUTRICIONISTA'` |
| grupo `Fiscal alimentação` | `perfil: 'FISCAL_ALIMENTACAO'` |
| grupo `Alimentação` | `perfil: 'ALIMENTACAO'` |
| `crn` | sempre `null` vindo do Erudio |

CRN (exemplo de formato `CRN10-9471`) mora no Mongo da nutrição, no documento do profissional, campo ligado a `erudioUsuarioId`. Não gravar CRN no mock do legado.

`null` em `erudioUnidadeEnsinoId` do calendário mockado é a SME (`instituicao_id = 16138`). Dia isolado de uma escola é outra linha, com o id da unidade. Não existe coluna `unidadeEnsinoId` na tabela de evento: a instituição do calendário é a SME ou a própria unidade.

Consulta de calendário para uma escola devolve os dias da SME e, na mesma data, a linha da unidade substitui a da rede. O mock atual só tem o calendário da SME em 2026.

IDs `24`, `25`, `26` e `27` aparecem em `etapasOfertadasIds` da Gaspar e do Aníbal e não vieram no catálogo de etapas. O mock não inventa nome para eles.

## Dataset

Implementação: `back-end/src/integrations/erudio/` e o espelho `front-end/src/mocks/erudio.mock.ts`. Os dois usam os mesmos IDs.

### Unidades

O campo `nome` não traz “CEI” nem “E.B.”. O nome de tela é `nomeCompleto` (`tipo` + `nome`). A “CEI Prof.ª Maria Tereza” do prompt antigo não está neste banco.

| id | nome completo | tipoId | bairro | etapas ofertadas |
| --- | --- | --- | --- | --- |
| 16147 | CENTRO DE EDUCAÇÃO INFANTIL ADÉLIA RUSSI SILVA | 1 | DOM BOSCO | 20, 21, 22, 23, 17, 18, 10 |
| 16181 | CENTRO DE EDUCAÇÃO INFANTIL DRA. ZILDA ARNS NEUMANN | 1 | CIDADE NOVA | 23, 17, 18, 10 |
| 16171 | ESCOLA BÁSICA GASPAR DA COSTA MORAES | 4 | FAZENDINHA | 1–9, 26, 27 |
| 16141 | ESCOLA BÁSICA ANÍBAL CÉSAR | 4 | SÃO VICENTE | 1–9, 24, 25, 26, 27 |

### Etapas e turnos

Infantil (`cursoId` 11, curso Educação Infantil): `20` Berçário I, `21` Berçário II, `22` Maternal I, `23` Maternal II, `17` Jardim I, `18` Jardim II, `10` Pré.

Fundamental (`cursoId` 10): `1` 1º Ano … `9` 9º Ano.

Turnos: `1` Matutino 07:00–11:45 `PARCIAL`, `2` Vespertino 12:40–18:00 `PARCIAL`, `3` Noturno 19:00–23:00 `PARCIAL`, `4` Integral 07:00–19:00 `INTEGRAL`.

### Contagem (CURSANDO + enturmação no mês, amostra nov/2026)

| unidade | etapa | turno | alunos |
| --- | --- | --- | --- |
| 16147 Adélia | 20 Berçário I | 4 Integral | 22 |
| 16147 | 21 Berçário II | 4 | 15 |
| 16147 | 22 Maternal I | 4 | 38 |
| 16147 | 17 Jardim I | 4 | 49 |
| 16181 Zilda | 17 Jardim I | 4 | 65 |
| 16181 | 18 Jardim II | 4 | 95 |
| 16171 Gaspar | 1 1º Ano | 4 | 27 |
| 16171 | 6 6º Ano | 1 Matutino | 68 |
| 16141 Aníbal | 1 1º Ano | 1 | 46 |
| 16141 | 8 8º Ano | 1 | 128 |

Alunos individuais (a restrição alimentar não vem daqui):

| matrícula | código | nome | unidade | etapa | turno |
| --- | --- | --- | --- | --- | --- |
| 153653 | 20261100075 | AILEEN VASQUEZ MURILLO | 16147 | 21 | 4 |
| 134363 | 20241104508 | ALICE DE BARROS SILVA | 16147 | 22 | 4 |
| 117707 | 20231104253 | ÁGATHA LINHARES FELIPE | 16147 | 17 | 4 |
| 158966 | 20261003233 | AFONSO MIKAEL GOMES DOS SANTOS | 16141 | 1 | 1 |
| 57919 | 20191002696 | ADAM CAUÊ SANTOS CAVALCANTE | 16141 | 8 | 1 |

Situação das cinco: `CURSANDO`.

### Calendário 2026 da SME (`instituicao_id` 16138)

Todos com `ehDiaLetivo: false`.

| data | evento | descrição |
| --- | --- | --- |
| 2026-01-28 | ATIVIDADE_ADMINISTRATIVA | Reunião pedagógica com diretores |
| 2026-02-16 | FERIADO | Emenda de feriado |
| 2026-02-17 | FERIADO | Carnaval |
| 2026-04-03 | FERIADO | Sexta-feira Santa |
| 2026-04-21 | FERIADO | Tiradentes |
| 2026-05-01 | FERIADO | Dia do Trabalhador |
| 2026-06-04 | FERIADO | Corpus Christi |
| 2026-06-15 | FERIADO | Aniversário de Itajaí |
| 2026-09-07 | FERIADO | Independência do Brasil |
| 2026-10-12 | FERIADO | Padroeira do Brasil |
| 2026-10-13 | FERIADO | Antecipação do Dia do Professor |
| 2026-11-02 | FERIADO | Finados |
| 2026-11-20 | FERIADO | Dia da Consciência Negra |

### Usuários

| id | nome | e-mail | grupo | instituição |
| --- | --- | --- | --- | --- |
| 124799 | DAIANE RIOS PEREIRA | daianerios@live.com | NUTRICIONISTAS | 16138 |
| 114250 | Fernanda Oliveira Ayala | null | NUTRICIONISTAS | 16138 |
| 124797 | JAYNE LUIZA DOS SANTOS | jaayynee@gmail.com | NUTRICIONISTAS | 16138 |
| 74431 | MEIRE CRISTIANE DE ASSIS DA SILVA | null | Alimentação | 16141 |

## Interface

`ERUDIO_PROVIDER` em `back-end/src/integrations/erudio/erudio.interfaces.ts`. Hoje o token aponta para `ErudioMockProvider`. A API real substitui a classe e mantém os métodos:

- `listarUnidades()`
- `listarEtapas()`
- `listarTurnos()`
- `listarContagemAlunos({ erudioUnidadeEnsinoId?, erudioEtapaId?, erudioTurnoId? })`
- `listarMatriculas({ erudioUnidadeEnsinoId? })`
- `listarCalendario({ erudioUnidadeEnsinoId?, de?, ate? })`
- `listarUsuarios({ grupo? })`

No front-end, `useErudioMock()` expõe as mesmas listas já adaptadas (`unidades`, `etapas`, `turnos`, `contagem`, `matriculas`, `calendario`, `usuarios`, `nutricionistas`) e os resolvedores `nomeUnidade`, `nomeEtapa` e `diaNaData`. Componentes não leem outro array de escola ou etapa do Erudio.

O `ErudioAdapterService` do módulo de lista de compras ainda lê a collection `demandas_escolares` (snapshot local do protótipo). Isso não é chamada ao legado. Quando a lista passar a usar o Erudio ao vivo, ela chama `IErudioProvider` e continua sem conhecer `tipo_id` nem `letivo`.

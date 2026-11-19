export const TIPOS_DIA_SEM_CONSUMO = ['FERIADO', 'REUNIAO_PEDAGOGICA', 'RECESSO'] as const;

export interface ItemRefeicaoCalculo {
  operador: 'E' | 'OU' | null;
  ativoParaCompra: boolean;
  fichaTecnicaId?: string;
  alimentoId?: string;
  perCapitaBruto?: number;
  /** Peso líquido TACO — base para derivar o bruto via `fatorCorrecao` do contrato. */
  perCapitaLiquido?: number;
  /**
   * Peso PRONTO servido por aluno quando o item é ficha técnica (receita-base).
   * O fator de escala é `porcaoServidaGramas / ficha.rendimentoTotalGramas`;
   * omitido = receita-base inteira (escala 1).
   */
  porcaoServidaGramas?: number;
}

export interface DiaConsumoCalculo {
  data: string;
  erudioEtapaId: number;
  tipoDia: string;
  refeicoes: Array<{ refeicao?: string; itens: ItemRefeicaoCalculo[] }>;
}

export interface IngredienteFichaCalculo {
  alimentoId: string;
  perCapitaBruto: number;
  /** Peso líquido TACO do ingrediente — base para derivar o bruto via `fatorCorrecao`. */
  perCapitaLiquido?: number;
}

export interface FichaCalculo {
  id: string;
  /** Rendimento pronto da receita-base (g). Necessário p/ escalar a porção servida. */
  rendimentoTotalGramas?: number;
  ingredientes: IngredienteFichaCalculo[];
}

export interface AlimentoCalculo {
  id: string;
  nome: string;
  categoria: string;
}

export interface ItemContratoCalculo {
  alimentoId: string;
  unidadeMedida: string;
  valorUnitario: number;
  ativo: boolean;
  /** Gramas por unidade de compra p/ MACO/UNIDADE/DUZIA/LITRO; nulo p/ KG/GRAMA. */
  gramasPorUnidade?: number | null;
  /**
   * Fator de correção bruto ÷ líquido do alimento licitado. Quando presente
   * (> 0) e a porção traz `perCapitaLiquido`, o peso de compra per capita é
   * DERIVADO (`líquido × fatorCorrecao`) em vez de usar `perCapitaBruto`.
   */
  fatorCorrecao?: number | null;
}

export interface ItemEmpenhoCalculo {
  alimentoId: string;
  qtdEmpenhada: number;
  unidadeMedida: string;
  valorUnitario: number;
  /** Deve coincidir com o `gramasPorUnidade` do item de contrato (validado no motor). */
  gramasPorUnidade?: number | null;
}

export interface EmpenhoCalculo {
  id: string;
  contratoHortiId: string;
  numeroEmpenho: string;
  ativo: boolean;
  itensEmpenhados: ItemEmpenhoCalculo[];
}

export interface DemandaCalculo {
  erudioUnidadeEnsinoId: number;
  erudioEtapaId: number;
  erudioTurnoId?: number;
  nomeEscola: string;
  alunosAtivos: number;
}

export interface SubstituicaoEspecialCalculo {
  erudioMatriculaId: number;
  erudioUnidadeEnsinoId: number;
  erudioEtapaId: number;
  status: string;
  alimentosNaoUtilizadosIds: string[];
  alimentosUtilizadosIds: string[];
  /** Restrições do laudo (`tipos_restricao`) — base do perfil de adaptação. */
  restricaoIds?: string[];
  /** `edu_matricula.aluno_id` — vincula o laudo à pessoa (contraturno). */
  erudioAlunoId?: number;
}

/** Override (delta) de um perfil: substitui a refeição inteira de um dia. */
export interface AdaptacaoOverrideCalculo {
  data: string;
  refeicao: string;
  itens: ItemRefeicaoCalculo[];
}

/** Perfil de adaptação de cardápio (herança + override). */
export interface AdaptacaoCalculo {
  id: string;
  erudioEtapaId: number;
  prioridade: number;
  restricoesIds: string[];
  ativo: boolean;
  overrides: AdaptacaoOverrideCalculo[];
}

export interface ConsumoAnterior {
  empenhoId: string;
  alimentoId: string;
  quantidade: number;
}

export interface RegraRefeicaoCalculo {
  erudioEtapaId: number;
  erudioTurnoId: number;
  refeicaoId: string;
  erudioUnidadeEnsinoId?: number | null;
  ativo: boolean;
}

/** Id da refeição de almoço no catálogo `tipos_refeicao` / cardápio. */
export const REFEICAO_ALMOCO_ID = 'ALMOCO';

/** Turnos do Erudio: 1 = Matutino, 2 = Vespertino, 3 = Noturno, 4 = Integral (ver docs/INTEGRACAO_ERUDIO_MOCKS.md). */
export const TURNO_MATUTINO_ERUDIO_ID = 1;
export const TURNO_VESPERTINO_ERUDIO_ID = 2;
export const TURNO_INTEGRAL_ERUDIO_ID = 4;

export type PadraoAlocacaoAlmoco = 'TURNO_MATUTINO' | 'TURNO_VESPERTINO';

/**
 * Vínculo individual de enturmação (granular). Vem de `matriculas_escolares`,
 * espelhando `edu_enturmacao` + `edu_turma` + `edu_matricula` do Erudio.
 * `dataEfetivacao`/`dataEncerramento` definam a vigência do vínculo no dia D;
 * ausentes (snapshot legado) = vínculo sempre ativo.
 */
export interface MatriculaCalculo {
  erudioEnturmacaoId?: number;
  erudioMatriculaId: number;
  erudioAlunoId: number;
  erudioUnidadeEnsinoId: number;
  nomeEscola: string;
  erudioEtapaId: number;
  erudioTurnoId: number;
  dataEfetivacao?: string | Date | null;
  dataEncerramento?: string | Date | null;
}

/** Flag `ofereceAlmocoContraturno` por unidade (collection `configuracoes_unidade_ensino`). */
export interface ConfiguracaoAlmocoUnidadeCalculo {
  erudioUnidadeEnsinoId: number;
  ofereceAlmocoContraturno: boolean;
}

export interface RateioEmpenhoCalculo {
  empenhoId: string;
  quantidade: number;
}

export interface AlocacaoCalculo {
  alimentoId: string;
  rateios: RateioEmpenhoCalculo[];
}

export interface EntradaRomaneio {
  datasSelecionadas: string[];
  dias: DiaConsumoCalculo[];
  fichas: FichaCalculo[];
  alimentos: AlimentoCalculo[];
  itensContrato: ItemContratoCalculo[];
  empenhos: EmpenhoCalculo[];
  demandas: DemandaCalculo[];
  regrasRefeicao?: RegraRefeicaoCalculo[];
  /**
   * Matrículas granulares. Quando presente e não vazia, o cálculo passa a ser
   * por refeição (contraturno): os lanches contam na unidade do vínculo e o
   * almoço do contraturno é alocado uma única vez conforme as configurações.
   * Vazio/ausente → comportamento agregado por `demandas` (retrocompatível).
   */
  matriculas?: MatriculaCalculo[];
  configuracoesAlmocoContraturno?: ConfiguracaoAlmocoUnidadeCalculo[];
  alocacaoAlmocoContraturnoPadrao?: PadraoAlocacaoAlmoco;
  /** Perfis de adaptação (alimentação especial). Só atua no caminho granular. */
  adaptacoes?: AdaptacaoCalculo[];
  especiais: SubstituicaoEspecialCalculo[];
  consumosAnteriores: ConsumoAnterior[];
  alocacoes?: AlocacaoCalculo[];
  arredondamentoTotalAlimentos: boolean;
}

export interface ItemPendente {
  alimentoId: string;
  nome: string;
  data: string;
  motivo: 'SEM_EMPENHO' | 'SEM_SALDO' | 'RATEIO_INSUFICIENTE';
  empenhoId?: string;
  quantidadeNecessaria?: number;
  saldoDisponivel?: number;
  quantidadeAlocada?: number;
  unidadeMedida?: string;
}

export interface SubstituicaoAplicada {
  erudioMatriculaId: number;
  alimentoOrigemId: string;
  alimentoDestinoId: string;
  quantidadeGramas: number;
}

export interface ItemEscola {
  alimentoId: string;
  nome: string;
  unidadeMedida: string;
  quantidade: number;
}

export interface RomaneioEscola {
  erudioUnidadeEnsinoId: number;
  nomeEscola: string;
  erudioEtapaId: number;
  alunosAtivos: number;
  itens: ItemEscola[];
  substituicoesAplicadas: SubstituicaoAplicada[];
}

export interface CandidatoEmpenho {
  empenhoId: string;
  numeroEmpenho: string;
  valorUnitario: number;
  saldoDisponivel: number;
}

export interface AlocacaoItemConsolidado {
  empenhoId: string;
  numeroEmpenho: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  saldoDisponivel: number;
  saldoRestante: number;
}

export interface ItemConsolidado {
  alimentoId: string;
  nome: string;
  unidadeMedida: string;
  quantidadeCalculada: number;
  quantidadePedida: number;
  candidatos: CandidatoEmpenho[];
  alocacoes: AlocacaoItemConsolidado[];
  totalAlocado: number;
  valorTotal: number;
}

export interface ResultadoRomaneio {
  datasConsideradas: string[];
  datasIgnoradas: string[];
  itensPendentes: ItemPendente[];
  consolidado: ItemConsolidado[];
  romaneio: RomaneioEscola[];
}

interface Porcao {
  alimentoId: string;
  gramas: number;
  data: string;
  erudioEtapaId: number;
  refeicaoId?: string;
}

/** Demanda resolvida por refeição: quantos alunos de um (unidade, etapa) comem aquela refeição. */
interface DemandaRefeicaoCalculo {
  /** Dia de consumo (YYYY-MM-DD) ao qual esta demanda se aplica. */
  data: string;
  erudioUnidadeEnsinoId: number;
  erudioEtapaId: number;
  erudioTurnoId: number;
  nomeEscola: string;
  /** `null` = todas as refeições da etapa (vínculo sem regra de turno cadastrada). */
  refeicaoId: string | null;
  /** Perfil de adaptação quando a linha consome itens de override; ausente = cardápio principal. */
  perfilId?: string;
  alunosAtivos: number;
}

interface DemandasGranulares {
  linhas: DemandaRefeicaoCalculo[];
  /** chave `${unidade}:${etapa}` → conjunto de chaves de aluno (para `alunosAtivos` do romaneio). */
  alunosPorEscola: Map<string, Set<string>>;
}

function selecionarItens(itens: ItemRefeicaoCalculo[]): ItemRefeicaoCalculo[] {
  const grupos: ItemRefeicaoCalculo[][] = [];
  for (const item of itens) {
    if (item.operador == null || grupos.length === 0) grupos.push([item]);
    else grupos.at(-1)?.push(item);
  }
  const escolhidos: ItemRefeicaoCalculo[] = [];
  for (const grupo of grupos) {
    const temOu = grupo.some((item) => item.operador === 'OU');
    if (temOu) escolhidos.push(...grupo.filter((item) => item.ativoParaCompra));
    else escolhidos.push(...grupo);
  }
  return escolhidos;
}

/**
 * Converte gramas de demanda para a unidade de compra do empenho/contrato.
 * KG → kg; GRAMA → g; MACO/UNIDADE/DUZIA/LITRO → divide por `gramasPorUnidade`
 * (ex.: 1 maço = 250 g). Sem `gramasPorUnidade` em unidade não-mássica,
 * retorna as gramas — o chamador deve ter validado antes (ver
 * `assertUnidadesEmpenhoContrato`).
 */
/**
 * Peso de compra (bruto) per capita de uma porção.
 *
 * Regra de precedência (ver docs/PESOS_E_UNIDADES.md):
 * 1. Se a porção traz `perCapitaLiquido` E o item de contrato tem
 *    `fatorCorrecao` > 0 → deriva `líquido × fatorCorrecao` (fonte de verdade:
 *    o líquido é a base TACO e o fator é o do alimento licitado).
 * 2. Caso contrário → `perCapitaBruto` gravado (legado/manual).
 * 3. Sem nenhum dos dois → `perCapitaLiquido` (melhor aproximação) ou 0.
 */
function perCapitaCompra(
  porcao: { perCapitaBruto?: number; perCapitaLiquido?: number },
  itemContrato?: ItemContratoCalculo,
): number {
  const fator = itemContrato?.fatorCorrecao;
  if (porcao.perCapitaLiquido !== undefined && fator !== undefined && fator !== null && fator > 0) {
    return porcao.perCapitaLiquido * fator;
  }
  return porcao.perCapitaBruto ?? porcao.perCapitaLiquido ?? 0;
}

/**
 * Fator de escala da receita-base para UM aluno:
 * `porcaoServidaGramas / rendimentoTotalGramas`. Se a porção não foi
 * informada, assume a receita-base inteira (escala 1). Sem rendimento
 * válido na ficha, também escala 1 (retrocompatibilidade).
 */
function fatorEscalaFicha(item: ItemRefeicaoCalculo, ficha?: FichaCalculo): number {
  const rendimento = ficha?.rendimentoTotalGramas;
  if (!rendimento || rendimento <= 0) return 1;
  const porcao = item.porcaoServidaGramas;
  if (porcao === undefined || porcao === null) return 1;
  return porcao / rendimento;
}

function paraUnidade(gramas: number, unidade: string, gramasPorUnidade?: number | null): number {
  if (unidade === 'KG') return gramas / 1000;
  if (unidade === 'GRAMA') return gramas;
  if (gramasPorUnidade && gramasPorUnidade > 0) return gramas / gramasPorUnidade;
  return gramas;
}

/**
 * Trava de integridade: empenho só pode ratear na unidade/gramasPorUnidade do
 * item de contrato licitado. Divergência = dado corrompido → aborta o cálculo
 * em vez de gerar lista com unidades incompatíveis.
 */
function assertUnidadesEmpenhoContrato(entrada: EntradaRomaneio): void {
  const contratoPorAlimento = new Map(
    entrada.itensContrato.filter((item) => item.ativo).map((item) => [item.alimentoId, item]),
  );
  for (const empenho of entrada.empenhos) {
    if (!empenho.ativo) continue;
    for (const item of empenho.itensEmpenhados) {
      const itemContrato = contratoPorAlimento.get(item.alimentoId);
      if (!itemContrato) continue;
      if (item.unidadeMedida !== itemContrato.unidadeMedida) {
        throw new Error(
          `Empenho ${empenho.numeroEmpenho} (${empenho.id}): unidadeMedida '${item.unidadeMedida}' ` +
            `difere do contrato '${itemContrato.unidadeMedida}' para o alimento ${item.alimentoId}`,
        );
      }
      const gContrato = itemContrato.gramasPorUnidade ?? null;
      const gEmpenho = item.gramasPorUnidade ?? null;
      if (gContrato !== null && gEmpenho !== null && gContrato !== gEmpenho) {
        throw new Error(
          `Empenho ${empenho.numeroEmpenho} (${empenho.id}): gramasPorUnidade ${gEmpenho} ` +
            `difere do contrato ${gContrato} para o alimento ${item.alimentoId}`,
        );
      }
    }
  }
}

function arredondar(valor: number): number {
  return Number(valor.toFixed(4));
}

/**
 * Motor do romaneio de compras.
 *
 * Domínio de pesos (ver docs/PESOS_E_UNIDADES.md): este cálculo opera
 * EXCLUSIVAMENTE sobre peso de compra (bruto) — `perCapitaBruto` dos itens do
 * cardápio/ficha, que já embute o fator de correção individual. O
 * `fatorCoccao`/`rendimentoTotalGramas` da ficha técnica NÃO se aplica aqui:
 * eles medem ganho/perda de água no preparo e definem o peso pronto servido
 * (porção do cardápio), não a quantidade a comprar.
 */
export function calcularRomaneio(entrada: EntradaRomaneio): ResultadoRomaneio {
  assertUnidadesEmpenhoContrato(entrada);
  const selecionadas = new Set(entrada.datasSelecionadas);
  const datasIgnoradas: string[] = [];
  const porcoes: Porcao[] = [];
  const fichas = new Map(entrada.fichas.map((ficha) => [ficha.id, ficha]));
  const alimentos = new Map(entrada.alimentos.map((alimento) => [alimento.id, alimento]));
  const contrato = new Map(
    entrada.itensContrato.filter((item) => item.ativo).map((item) => [item.alimentoId, item]),
  );
  const empenhos = new Map(entrada.empenhos.map((empenho) => [empenho.id, empenho]));

  for (const dia of entrada.dias) {
    if (!selecionadas.has(dia.data)) continue;
    if (TIPOS_DIA_SEM_CONSUMO.includes(dia.tipoDia as (typeof TIPOS_DIA_SEM_CONSUMO)[number])) {
      datasIgnoradas.push(dia.data);
      continue;
    }
    for (const refeicao of dia.refeicoes) {
      for (const item of selecionarItens(refeicao.itens)) {
        if (item.fichaTecnicaId) {
          const ficha = fichas.get(item.fichaTecnicaId);
          // Receita-base: o bruto do ingrediente é da receita inteira;
          // escala por `porcaoServidaGramas / rendimentoTotalGramas`.
          const escala = fatorEscalaFicha(item, ficha);
          for (const ingrediente of ficha?.ingredientes ?? []) {
            const itemContrato = contrato.get(ingrediente.alimentoId);
            if (!itemContrato) continue;
            porcoes.push({
              alimentoId: ingrediente.alimentoId,
              gramas: perCapitaCompra(ingrediente, itemContrato) * escala,
              data: dia.data,
              erudioEtapaId: dia.erudioEtapaId,
              refeicaoId: refeicao.refeicao,
            });
          }
          continue;
        }
        if (!item.alimentoId) continue;
        const itemContratoAvulso = contrato.get(item.alimentoId);
        if (!itemContratoAvulso) continue;
        porcoes.push({
          alimentoId: item.alimentoId,
          gramas: perCapitaCompra(item, itemContratoAvulso),
          data: dia.data,
          erudioEtapaId: dia.erudioEtapaId,
          refeicaoId: refeicao.refeicao,
        });
      }
    }
  }

  const datasConsideradas = [...new Set(porcoes.map((porcao) => porcao.data))].sort();
  const pendencias: ItemPendente[] = [];

  const gramasEscola = new Map<string, { unidade: number; etapa: number; alimentoId: string; gramas: number }>();
  const romaneio = new Map<string, RomaneioEscola>();
  const chaveEscola = (unidade: number, etapa: number) => `${unidade}:${etapa}`;

  const regrasAtivas = (entrada.regrasRefeicao ?? []).filter((regra) => regra.ativo);
  const refeicoesPermitidas = (demanda: {
    erudioEtapaId: number;
    erudioTurnoId?: number;
    erudioUnidadeEnsinoId: number;
  }): Set<string> | null => {
    if (demanda.erudioTurnoId === undefined) return null;
    const doBloco = (unidade: number | null | undefined) =>
      regrasAtivas.filter(
        (regra) =>
          regra.erudioEtapaId === demanda.erudioEtapaId &&
          regra.erudioTurnoId === demanda.erudioTurnoId &&
          (regra.erudioUnidadeEnsinoId ?? null) === (unidade ?? null),
      );
    const especificas = doBloco(demanda.erudioUnidadeEnsinoId);
    const gerais = doBloco(null);
    const regras = especificas.length > 0 ? especificas : gerais;
    if (regras.length === 0) return null;
    return new Set(regras.map((regra) => regra.refeicaoId));
  };

  const granular = montarDemandasGranulares(entrada, refeicoesPermitidas, porcoes);
  const adaptacoesPorId = new Map((entrada.adaptacoes ?? []).map((adaptacao) => [adaptacao.id, adaptacao]));

  const expandirItensOverride = (itens: ItemRefeicaoCalculo[]): Array<{ alimentoId: string; gramas: number }> => {
    const saida: Array<{ alimentoId: string; gramas: number }> = [];
    for (const item of selecionarItens(itens)) {
      if (item.fichaTecnicaId) {
        const ficha = fichas.get(item.fichaTecnicaId);
        const escala = fatorEscalaFicha(item, ficha);
        for (const ingrediente of ficha?.ingredientes ?? []) {
          const itemContrato = contrato.get(ingrediente.alimentoId);
          if (!itemContrato) continue;
          saida.push({
            alimentoId: ingrediente.alimentoId,
            gramas: perCapitaCompra(ingrediente, itemContrato) * escala,
          });
        }
        continue;
      }
      if (!item.alimentoId) continue;
      const itemContrato = contrato.get(item.alimentoId);
      if (!itemContrato) continue;
      saida.push({ alimentoId: item.alimentoId, gramas: perCapitaCompra(item, itemContrato) });
    }
    return saida;
  };

  if (granular) {
    for (const linha of granular.linhas) {
      if (linha.perfilId) {
        const override = adaptacoesPorId
          .get(linha.perfilId)
          ?.overrides.find((item) => item.data === linha.data && item.refeicao === linha.refeicaoId);
        if (override) {
          const chave = chaveEscola(linha.erudioUnidadeEnsinoId, linha.erudioEtapaId);
          if (!romaneio.has(chave)) {
            romaneio.set(chave, {
              erudioUnidadeEnsinoId: linha.erudioUnidadeEnsinoId,
              nomeEscola: linha.nomeEscola,
              erudioEtapaId: linha.erudioEtapaId,
              alunosAtivos: 0,
              itens: [],
              substituicoesAplicadas: [],
            });
          }
          for (const ingrediente of expandirItensOverride(override.itens)) {
            somarGramas(gramasEscola, {
              unidade: linha.erudioUnidadeEnsinoId,
              etapa: linha.erudioEtapaId,
              alimentoId: ingrediente.alimentoId,
              gramas: ingrediente.gramas * linha.alunosAtivos,
            });
          }
          continue;
        }
      }
      const porcoesEtapa = porcoes.filter(
        (porcao) =>
          porcao.data === linha.data &&
          porcao.erudioEtapaId === linha.erudioEtapaId &&
          (linha.refeicaoId === null || porcao.refeicaoId === linha.refeicaoId),
      );
      if (porcoesEtapa.length === 0 || linha.alunosAtivos <= 0) continue;
      const chave = chaveEscola(linha.erudioUnidadeEnsinoId, linha.erudioEtapaId);
      let escola = romaneio.get(chave);
      if (!escola) {
        escola = {
          erudioUnidadeEnsinoId: linha.erudioUnidadeEnsinoId,
          nomeEscola: linha.nomeEscola,
          erudioEtapaId: linha.erudioEtapaId,
          alunosAtivos: 0,
          itens: [],
          substituicoesAplicadas: [],
        };
        romaneio.set(chave, escola);
      }
      for (const porcao of porcoesEtapa) {
        somarGramas(gramasEscola, {
          unidade: linha.erudioUnidadeEnsinoId,
          etapa: linha.erudioEtapaId,
          alimentoId: porcao.alimentoId,
          gramas: porcao.gramas * linha.alunosAtivos,
        });
      }
    }
    for (const [chave, alunos] of granular.alunosPorEscola) {
      const escola = romaneio.get(chave);
      if (escola) escola.alunosAtivos = alunos.size;
    }
  } else {
    for (const demanda of entrada.demandas) {
    const permitidas = refeicoesPermitidas(demanda);
    const porcoesEtapa = porcoes.filter((porcao) => {
      if (porcao.erudioEtapaId !== demanda.erudioEtapaId) return false;
      if (!permitidas || !porcao.refeicaoId) return true;
      return permitidas.has(porcao.refeicaoId);
    });
    if (porcoesEtapa.length === 0 || demanda.alunosAtivos <= 0) continue;
    const chave = chaveEscola(demanda.erudioUnidadeEnsinoId, demanda.erudioEtapaId);
    const escola: RomaneioEscola = {
      erudioUnidadeEnsinoId: demanda.erudioUnidadeEnsinoId,
      nomeEscola: demanda.nomeEscola,
      erudioEtapaId: demanda.erudioEtapaId,
      alunosAtivos: demanda.alunosAtivos,
      itens: [],
      substituicoesAplicadas: [],
    };
    romaneio.set(chave, escola);
    for (const porcao of porcoesEtapa) {
      somarGramas(gramasEscola, {
        unidade: demanda.erudioUnidadeEnsinoId,
        etapa: demanda.erudioEtapaId,
        alimentoId: porcao.alimentoId,
        gramas: porcao.gramas * demanda.alunosAtivos,
      });
    }
    }
  }

  // Laudos cobertos por um perfil de adaptação são resolvidos pelo caminho
  // granular (herança/override); a substituição legada 1:1 só vale para os demais.
  const restricoesComPerfil = new Set(
    (entrada.adaptacoes ?? []).filter((adaptacao) => adaptacao.ativo).flatMap((adaptacao) => adaptacao.restricoesIds),
  );
  const especiaisLegado = entrada.especiais.filter((item) => {
    if (item.status !== 'DEFERIDO') return false;
    if (!granular || restricoesComPerfil.size === 0) return true;
    return !(item.restricaoIds ?? []).some((restricaoId) => restricoesComPerfil.has(restricaoId));
  });
  for (const especial of especiaisLegado) {
    const chave = chaveEscola(especial.erudioUnidadeEnsinoId, especial.erudioEtapaId);
    const escola = romaneio.get(chave);
    if (!escola) continue;
    const porcoesEtapa = porcoes.filter((porcao) => porcao.erudioEtapaId === especial.erudioEtapaId);
    for (const origemId of especial.alimentosNaoUtilizadosIds) {
      const origem = alimentos.get(origemId);
      const destinoId = especial.alimentosUtilizadosIds.find((id) => alimentos.get(id)?.categoria === origem?.categoria);
      if (!origem || !destinoId || !contrato.has(origemId) || !contrato.has(destinoId)) continue;
      const doDia = new Map<string, { gramas: number }>();
      for (const porcao of porcoesEtapa.filter((item) => item.alimentoId === origemId)) {
        const atual = doDia.get(porcao.data) ?? { gramas: 0 };
        atual.gramas += porcao.gramas;
        doDia.set(porcao.data, atual);
      }
      for (const porcao of doDia.values()) {
        if (porcao.gramas <= 0) continue;
        somarGramas(gramasEscola, {
          unidade: especial.erudioUnidadeEnsinoId,
          etapa: especial.erudioEtapaId,
          alimentoId: origemId,
          gramas: -porcao.gramas,
        });
        somarGramas(gramasEscola, {
          unidade: especial.erudioUnidadeEnsinoId,
          etapa: especial.erudioEtapaId,
          alimentoId: destinoId,
          gramas: porcao.gramas,
        });
        escola.substituicoesAplicadas.push({
          erudioMatriculaId: especial.erudioMatriculaId,
          alimentoOrigemId: origemId,
          alimentoDestinoId: destinoId,
          quantidadeGramas: porcao.gramas,
        });
      }
    }
  }

  const totais = new Map<string, { alimentoId: string; gramas: number }>();
  for (const linha of gramasEscola.values()) {
    if (linha.gramas <= 0) continue;
    const atual = totais.get(linha.alimentoId) ?? { alimentoId: linha.alimentoId, gramas: 0 };
    atual.gramas += linha.gramas;
    totais.set(linha.alimentoId, atual);
    const escola = romaneio.get(chaveEscola(linha.unidade, linha.etapa));
    const itemContrato = contrato.get(linha.alimentoId);
    if (!escola || !itemContrato) continue;
    escola.itens.push({
      alimentoId: linha.alimentoId,
      nome: alimentos.get(linha.alimentoId)?.nome ?? linha.alimentoId,
      unidadeMedida: itemContrato.unidadeMedida,
      quantidade: arredondar(paraUnidade(linha.gramas, itemContrato.unidadeMedida, itemContrato.gramasPorUnidade)),
    });
  }

  const saldoEmpenho = (empenhoId: string, alimentoId: string): number => {
    const itemEmpenho = empenhos.get(empenhoId)?.itensEmpenhados.find((item) => item.alimentoId === alimentoId);
    if (!itemEmpenho) return 0;
    const jaConsumido = entrada.consumosAnteriores
      .filter((consumo) => consumo.empenhoId === empenhoId && consumo.alimentoId === alimentoId)
      .reduce((soma, consumo) => soma + consumo.quantidade, 0);
    return arredondar(itemEmpenho.qtdEmpenhada - jaConsumido);
  };

  const alocacoesEntrada = new Map(
    (entrada.alocacoes ?? []).map((alocacao) => [alocacao.alimentoId, alocacao.rateios]),
  );
  const validarRateios = entrada.alocacoes !== undefined;

  const consolidado: ItemConsolidado[] = [];
  for (const total of totais.values()) {
    const itemContrato = contrato.get(total.alimentoId);
    if (!itemContrato) continue;
    const quantidadeCalculada = arredondar(paraUnidade(total.gramas, itemContrato.unidadeMedida, itemContrato.gramasPorUnidade));
    const quantidadePedida = entrada.arredondamentoTotalAlimentos ? Math.ceil(quantidadeCalculada) : quantidadeCalculada;
    const nomeAlimento = alimentos.get(total.alimentoId)?.nome ?? total.alimentoId;

    const candidatos: CandidatoEmpenho[] = entrada.empenhos
      .filter((empenho) => empenho.ativo && empenho.itensEmpenhados.some((item) => item.alimentoId === total.alimentoId))
      .map((empenho) => {
        const itemEmpenho = empenho.itensEmpenhados.find((item) => item.alimentoId === total.alimentoId);
        return {
          empenhoId: empenho.id,
          numeroEmpenho: empenho.numeroEmpenho,
          valorUnitario: itemEmpenho?.valorUnitario ?? itemContrato.valorUnitario,
          saldoDisponivel: saldoEmpenho(empenho.id, total.alimentoId),
        };
      });

    if (candidatos.length === 0) {
      pendencias.push({
        alimentoId: total.alimentoId,
        nome: nomeAlimento,
        data: datasConsideradas.join(', '),
        motivo: 'SEM_EMPENHO',
        unidadeMedida: itemContrato.unidadeMedida,
      });
    }

    const alocacoes: AlocacaoItemConsolidado[] = [];
    let totalAlocado = 0;
    let valorTotal = 0;
    const rateios = alocacoesEntrada.get(total.alimentoId) ?? [];
    for (const rateio of rateios) {
      if (!rateio || !(rateio.quantidade > 0)) continue;
      const candidato = candidatos.find((item) => item.empenhoId === rateio.empenhoId);
      if (!candidato) {
        pendencias.push({
          alimentoId: total.alimentoId,
          nome: nomeAlimento,
          data: datasConsideradas.join(', '),
          motivo: 'SEM_EMPENHO',
          empenhoId: rateio.empenhoId,
          unidadeMedida: itemContrato.unidadeMedida,
        });
        continue;
      }
      const saldoRestante = arredondar(candidato.saldoDisponivel - rateio.quantidade);
      if (rateio.quantidade > candidato.saldoDisponivel) {
        pendencias.push({
          alimentoId: total.alimentoId,
          nome: nomeAlimento,
          data: datasConsideradas.join(', '),
          motivo: 'SEM_SALDO',
          empenhoId: rateio.empenhoId,
          quantidadeNecessaria: rateio.quantidade,
          saldoDisponivel: candidato.saldoDisponivel,
          unidadeMedida: itemContrato.unidadeMedida,
        });
      }
      totalAlocado = arredondar(totalAlocado + rateio.quantidade);
      const valor = arredondar(rateio.quantidade * candidato.valorUnitario);
      valorTotal = arredondar(valorTotal + valor);
      alocacoes.push({
        empenhoId: rateio.empenhoId,
        numeroEmpenho: candidato.numeroEmpenho,
        quantidade: rateio.quantidade,
        valorUnitario: candidato.valorUnitario,
        valorTotal: valor,
        saldoDisponivel: candidato.saldoDisponivel,
        saldoRestante,
      });
    }

    if (validarRateios && totalAlocado < quantidadePedida) {
      pendencias.push({
        alimentoId: total.alimentoId,
        nome: nomeAlimento,
        data: datasConsideradas.join(', '),
        motivo: 'RATEIO_INSUFICIENTE',
        quantidadeNecessaria: quantidadePedida,
        quantidadeAlocada: totalAlocado,
        unidadeMedida: itemContrato.unidadeMedida,
      });
    }

    consolidado.push({
      alimentoId: total.alimentoId,
      nome: nomeAlimento,
      unidadeMedida: itemContrato.unidadeMedida,
      quantidadeCalculada,
      quantidadePedida,
      candidatos,
      alocacoes,
      totalAlocado,
      valorTotal,
    });
  }

  return {
    datasConsideradas,
    datasIgnoradas: [...new Set(datasIgnoradas)].sort(),
    itensPendentes: pendencias,
    consolidado,
    romaneio: [...romaneio.values()].filter((escola) => escola.itens.length > 0 || escola.substituicoesAplicadas.length > 0),
  };
}

function somarGramas(
  mapa: Map<string, { unidade: number; etapa: number; alimentoId: string; gramas: number }>,
  linha: { unidade: number; etapa: number; alimentoId: string; gramas: number },
): void {
  const chave = `${linha.unidade}:${linha.etapa}:${linha.alimentoId}`;
  const atual = mapa.get(chave) ?? { ...linha, gramas: 0 };
  atual.gramas += linha.gramas;
  mapa.set(chave, atual);
}

/** Normaliza `dataEfetivacao`/`dataEncerramento` para `YYYY-MM-DD` (ou null). */
function dataISO(valor: string | Date | null | undefined): string | null {
  if (!valor) return null;
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  return valor.slice(0, 10);
}

/**
 * Vínculo ativo no dia D: `dataEfetivacao <= D` e
 * (`dataEncerramento` nula ou `> D`). No dia exato do encerramento a unidade
 * antiga já não conta — evita duplicidade com a unidade destino na transferência.
 */
function vinculoAtivoEm(vinculo: MatriculaCalculo, dia: string): boolean {
  const efetivacao = dataISO(vinculo.dataEfetivacao);
  const encerramento = dataISO(vinculo.dataEncerramento);
  return (efetivacao === null || efetivacao <= dia) && (encerramento === null || encerramento > dia);
}

/** Desempate de mesmo turno: fica a enturmação com `dataEfetivacao` mais recente. */
function maisRecente(a: MatriculaCalculo, b: MatriculaCalculo): MatriculaCalculo {
  const efetA = dataISO(a.dataEfetivacao) ?? '';
  const efetB = dataISO(b.dataEfetivacao) ?? '';
  if (efetA !== efetB) return efetA > efetB ? a : b;
  const idA = a.erudioEnturmacaoId ?? a.erudioMatriculaId;
  const idB = b.erudioEnturmacaoId ?? b.erudioMatriculaId;
  return idA >= idB ? a : b;
}

/**
 * Converte os vínculos granulares de enturmação em demandas por refeição e por
 * dia, aplicando contraturno. Retorna `null` quando não há vínculos — o chamador
 * cai no caminho agregado (`demandas`), preservando o comportamento antigo.
 *
 * Regras (ver docs/REGRAS_CONTRATURNO_ALMOCO.md):
 * - Para cada dia D com consumo, só entram vínculos ativos em D
 *   (`dataEfetivacao <= D` e `dataEncerramento` nula ou `> D`).
 * - Mesmo aluno com duas enturmações no mesmo turno em D → fica a de
 *   `dataEfetivacao` mais recente (inconsistência/troca).
 * - Contraturno = mesmo `erudioAlunoId`, no mesmo dia D, em 2+ unidades
 *   distintas cobrindo turno matutino (1) e vespertino (2). A dupla matrícula
 *   é o que gera o benefício do almoço.
 * - Lanches: cada vínculo conta nas refeições permitidas pela matriz
 *   etapa/turno/unidade, na unidade onde o aluno frequenta aquele turno.
 * - Almoço do contraturno: servido por padrão pela primeira unidade (a do
 *   turno matutino) e contado UMA vez. A unidade só serve se
 *   `ofereceAlmocoContraturno` for true — se a da manhã não oferece, a da
 *   tarde assume desde que ela ofereça; se ambas oferecem, vale o desempate
 *   `alocacaoAlmocoContraturnoPadrao`; se nenhuma oferece, não há almoço.
 *   O almoço é removido das refeições do vínculo para nunca contar em
 *   duplicidade.
 */
function montarDemandasGranulares(
  entrada: EntradaRomaneio,
  permitidas: (demanda: {
    erudioEtapaId: number;
    erudioTurnoId?: number;
    erudioUnidadeEnsinoId: number;
  }) => Set<string> | null,
  porcoes: Porcao[],
): DemandasGranulares | null {
  const matriculas = entrada.matriculas ?? [];
  if (matriculas.length === 0) return null;

  const configuradas = new Map(
    (entrada.configuracoesAlmocoContraturno ?? []).map((config) => [
      config.erudioUnidadeEnsinoId,
      config.ofereceAlmocoContraturno,
    ]),
  );
  const unidadeOfereceAlmoco = (unidade: number) => configuradas.get(unidade) ?? true;
  const padrao = entrada.alocacaoAlmocoContraturnoPadrao ?? 'TURNO_MATUTINO';
  const turnoAlvo = padrao === 'TURNO_VESPERTINO' ? TURNO_VESPERTINO_ERUDIO_ID : TURNO_MATUTINO_ERUDIO_ID;

  // ---- Alimentação especial: laudo → restrições → perfil de adaptação ----
  const adaptacoesPorEtapa = new Map<number, AdaptacaoCalculo[]>();
  for (const adaptacao of (entrada.adaptacoes ?? []).filter((item) => item.ativo)) {
    const lista = adaptacoesPorEtapa.get(adaptacao.erudioEtapaId) ?? [];
    lista.push(adaptacao);
    adaptacoesPorEtapa.set(adaptacao.erudioEtapaId, lista);
  }
  for (const lista of adaptacoesPorEtapa.values()) lista.sort((a, b) => a.prioridade - b.prioridade);

  const matriculaIdsPorAluno = new Map<string, Set<number>>();
  for (const matricula of matriculas) {
    const chave = `aluno:${matricula.erudioAlunoId}`;
    const conjunto = matriculaIdsPorAluno.get(chave) ?? new Set<number>();
    conjunto.add(matricula.erudioMatriculaId);
    matriculaIdsPorAluno.set(chave, conjunto);
  }
  const restricoesPorAluno = new Map<string, Set<string>>();
  for (const especial of entrada.especiais.filter((item) => item.status === 'DEFERIDO')) {
    for (const [alunoChave, matriculaIds] of matriculaIdsPorAluno) {
      const pertence =
        (especial.erudioAlunoId !== undefined && `aluno:${especial.erudioAlunoId}` === alunoChave) ||
        matriculaIds.has(especial.erudioMatriculaId);
      if (!pertence) continue;
      const conjunto = restricoesPorAluno.get(alunoChave) ?? new Set<string>();
      for (const restricaoId of especial.restricaoIds ?? []) conjunto.add(restricaoId);
      restricoesPorAluno.set(alunoChave, conjunto);
    }
  }
  const perfilPara = (etapa: number, restricoes: Set<string>): AdaptacaoCalculo | undefined => {
    if (restricoes.size === 0) return undefined;
    return (adaptacoesPorEtapa.get(etapa) ?? []).find((adaptacao) =>
      adaptacao.restricoesIds.some((restricaoId) => restricoes.has(restricaoId)),
    );
  };
  const temOverride = (perfil: AdaptacaoCalculo | undefined, dia: string, refeicaoId: string): boolean =>
    perfil?.overrides.some((override) => override.data === dia && override.refeicao === refeicaoId) ?? false;

  const refeicoesPorEtapa = new Map<number, Set<string>>();
  const datasConsumo = new Set<string>();
  for (const porcao of porcoes) {
    datasConsumo.add(porcao.data);
    if (!porcao.refeicaoId) continue;
    const conjunto = refeicoesPorEtapa.get(porcao.erudioEtapaId) ?? new Set<string>();
    conjunto.add(porcao.refeicaoId);
    refeicoesPorEtapa.set(porcao.erudioEtapaId, conjunto);
  }

  const linhas = new Map<string, DemandaRefeicaoCalculo>();
  const alunosPorEscola = new Map<string, Set<string>>();

  const adicionarLinha = (
    linha: Omit<DemandaRefeicaoCalculo, 'alunosAtivos'>,
    alunoChave: string,
  ): void => {
    const chave = `${linha.data}|${linha.erudioUnidadeEnsinoId}|${linha.erudioEtapaId}|${linha.erudioTurnoId}|${linha.refeicaoId ?? '*'}|${linha.perfilId ?? 'COMUM'}`;
    const atual = linhas.get(chave) ?? { ...linha, alunosAtivos: 0 };
    atual.alunosAtivos += 1;
    linhas.set(chave, atual);
    const chaveEscola = `${linha.erudioUnidadeEnsinoId}:${linha.erudioEtapaId}`;
    const conjunto = alunosPorEscola.get(chaveEscola) ?? new Set<string>();
    conjunto.add(alunoChave);
    alunosPorEscola.set(chaveEscola, conjunto);
  };

  for (const dia of [...datasConsumo].sort()) {
    const ativosNoDia = matriculas.filter((matricula) => vinculoAtivoEm(matricula, dia));
    const alunos = new Map<string, MatriculaCalculo[]>();
    for (const matricula of ativosNoDia) {
      const chave = `aluno:${matricula.erudioAlunoId}`;
      const lista = alunos.get(chave) ?? [];
      lista.push(matricula);
      alunos.set(chave, lista);
    }

    for (const [alunoChave, vinculosAluno] of alunos) {
      // Desempate de mesmo turno: uma enturmação por turno, a mais recente.
      const porTurno = new Map<number, MatriculaCalculo>();
      for (const vinculo of vinculosAluno) {
        const atual = porTurno.get(vinculo.erudioTurnoId);
        porTurno.set(vinculo.erudioTurnoId, atual ? maisRecente(atual, vinculo) : vinculo);
      }
      const vinculos = [...porTurno.values()];

      const unidades = new Set(vinculos.map((vinculo) => vinculo.erudioUnidadeEnsinoId));
      const turnos = new Set(vinculos.map((vinculo) => vinculo.erudioTurnoId));
      const contraturno =
        unidades.size >= 2 && turnos.has(TURNO_MATUTINO_ERUDIO_ID) && turnos.has(TURNO_VESPERTINO_ERUDIO_ID);

      const restricoesAluno = restricoesPorAluno.get(alunoChave) ?? new Set<string>();

      for (const vinculo of vinculos) {
        const perfilVinculo = perfilPara(vinculo.erudioEtapaId, restricoesAluno);
        const temOverrideNoDia = perfilVinculo?.overrides.some((override) => override.data === dia) ?? false;
        const permitidasDoVinculo = permitidas(vinculo);
        let refeicoesDoVinculo: Array<string | null>;
        if (vinculo.erudioTurnoId === TURNO_INTEGRAL_ERUDIO_ID) {
          // Turno integral: o aluno fica o dia inteiro na escola e consome
          // todas as refeições da etapa, independentemente da matriz de turno.
          const todas = [...(refeicoesPorEtapa.get(vinculo.erudioEtapaId) ?? [])];
          const efetivas = contraturno ? todas.filter((id) => id !== REFEICAO_ALMOCO_ID) : todas;
          refeicoesDoVinculo = efetivas.length > 0 ? efetivas : contraturno ? [] : [null];
        } else if (permitidasDoVinculo) {
          refeicoesDoVinculo = [...permitidasDoVinculo].filter((id) => !(contraturno && id === REFEICAO_ALMOCO_ID));
        } else if (contraturno) {
          refeicoesDoVinculo = [...(refeicoesPorEtapa.get(vinculo.erudioEtapaId) ?? [])].filter(
            (id) => id !== REFEICAO_ALMOCO_ID,
          );
        } else {
          refeicoesDoVinculo = [null];
        }
        // Com override no dia, linhas "todas as refeições" precisam virar
        // linhas por refeição para o perfil poder substituir só o que mudou.
        if (refeicoesDoVinculo.length === 1 && refeicoesDoVinculo[0] === null && temOverrideNoDia) {
          refeicoesDoVinculo = [...(refeicoesPorEtapa.get(vinculo.erudioEtapaId) ?? [])];
          if (refeicoesDoVinculo.length === 0) refeicoesDoVinculo = [null];
        }
        for (const refeicaoId of refeicoesDoVinculo) {
          const perfilId =
            refeicaoId !== null && perfilVinculo && temOverride(perfilVinculo, dia, refeicaoId)
              ? perfilVinculo.id
              : undefined;
          adicionarLinha(
            {
              data: dia,
              erudioUnidadeEnsinoId: vinculo.erudioUnidadeEnsinoId,
              erudioEtapaId: vinculo.erudioEtapaId,
              erudioTurnoId: vinculo.erudioTurnoId,
              nomeEscola: vinculo.nomeEscola,
              refeicaoId,
              perfilId,
            },
            alunoChave,
          );
        }
      }

      if (!contraturno) continue;

      const unidadesOrdenadas = [...unidades].sort((a, b) => a - b);
      const oferecidas = unidadesOrdenadas.filter(unidadeOfereceAlmoco);
      let unidadeAlmoco: number | undefined;
      if (oferecidas.length === 1) {
        unidadeAlmoco = oferecidas[0];
      } else if (oferecidas.length > 1) {
        unidadeAlmoco =
          unidadesOrdenadas.find(
            (unidade) =>
              unidadeOfereceAlmoco(unidade) &&
              vinculos.some(
                (vinculo) => vinculo.erudioUnidadeEnsinoId === unidade && vinculo.erudioTurnoId === turnoAlvo,
              ),
          ) ?? oferecidas[0];
      }
      if (unidadeAlmoco === undefined) continue;

      const vinculoAlmoco =
        vinculos.find(
          (vinculo) => vinculo.erudioUnidadeEnsinoId === unidadeAlmoco && vinculo.erudioTurnoId === turnoAlvo,
        ) ?? vinculos.find((vinculo) => vinculo.erudioUnidadeEnsinoId === unidadeAlmoco);
      if (!vinculoAlmoco) continue;

      const perfilAlmoco = perfilPara(vinculoAlmoco.erudioEtapaId, restricoesAluno);
      adicionarLinha(
        {
          data: dia,
          erudioUnidadeEnsinoId: unidadeAlmoco,
          erudioEtapaId: vinculoAlmoco.erudioEtapaId,
          erudioTurnoId: vinculoAlmoco.erudioTurnoId,
          nomeEscola: vinculoAlmoco.nomeEscola,
          refeicaoId: REFEICAO_ALMOCO_ID,
          perfilId: temOverride(perfilAlmoco, dia, REFEICAO_ALMOCO_ID) ? perfilAlmoco?.id : undefined,
        },
        alunoChave,
      );
    }
  }

  return { linhas: [...linhas.values()], alunosPorEscola };
}

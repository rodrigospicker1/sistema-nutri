export const TIPOS_DIA_SEM_CONSUMO = ['FERIADO', 'REUNIAO_PEDAGOGICA', 'RECESSO'] as const;

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
  /** RATEIO_INSUFICIENTE: soma dos saldos de todos os empenhos candidatos do alimento. */
  saldoTotalDisponivel?: number;
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
  /** ISO — ordena o rateio sugerido (vence primeiro consome primeiro). */
  dataFim?: string;
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
  /** true quando `alocacoes` veio da sugestão automática do motor (sem rateio manual). */
  rateioSugerido?: boolean;
}

export interface RateioEmpenho {
  empenhoId: string;
  quantidade: number;
}

export interface AlocacaoAlimento {
  alimentoId: string;
  rateios: RateioEmpenho[];
}

export interface ResultadoRomaneio {
  datasConsideradas: string[];
  datasIgnoradas: string[];
  itensPendentes: ItemPendente[];
  consolidado: ItemConsolidado[];
  romaneio: RomaneioEscola[];
  /** Rateios efetivamente aplicados por alimento (manuais ou sugeridos). */
  alocacoesEfetivas: AlocacaoAlimento[];
}

/** Documento persistido por POST /listas-compras/gerar (GET /listas-compras/:id). */
export interface ListaCompras {
  id: string
  /** Contrato principal (legado); listas multi-contrato usam contratoHortiIds. */
  contratoHortiId?: string
  contratoHortiIds?: string[]
  datasConsumo: string[]
  erudioEtapaIds?: number[]
  erudioUnidadeEnsinoIds?: number[]
  status: 'RASCUNHO' | 'GERADA' | 'CONFIRMADA' | 'CANCELADA'
  datasConsideradas: string[]
  datasIgnoradas: string[]
  consolidado: ItemConsolidado[]
  romaneio: RomaneioEscola[]
  alocacoes: AlocacaoAlimento[]
  itensPendentes: ItemPendente[]
  createdAt?: string
}

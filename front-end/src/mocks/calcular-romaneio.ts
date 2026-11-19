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
}

export const ERUDIO_SME_INSTITUICAO_ID = 16138;

export const ERUDIO_PROVIDER = Symbol('ERUDIO_PROVIDER');

export type TipoUnidadeNutricao = 'CEI' | 'ESCOLA_BASICA';

export type FaixaFnde = 'EDUCACAO_INFANTIL' | 'FUNDAMENTAL_I' | 'FUNDAMENTAL_II';

export type ModalidadeTurno = 'PARCIAL' | 'INTEGRAL';

export type TipoEventoErudio = 'FERIADO' | 'RECESSO' | 'ATIVIDADE_ADMINISTRATIVA' | 'ATIVIDADE_ESCOLAR';

export type TipoDiaCardapioNutricao = 'LETIVO' | 'FERIADO' | 'REUNIAO_PEDAGOGICA' | 'RECESSO';

export type PerfilUsuarioNutricao = 'NUTRICIONISTA' | 'FISCAL_ALIMENTACAO' | 'ALIMENTACAO';

/** Linha de unidade como o legado devolve (`tipo_id` + nome do tipo). */
export interface ErudioUnidadeEnsinoRaw {
  id: number;
  nome: string;
  nomeCompleto: string;
  tipoId: number;
  tipo: string;
  bairro: string;
  etapasOfertadasIds: number[];
  ativo: boolean;
}

export interface UnidadeEnsinoNutricao {
  erudioUnidadeEnsinoId: number;
  nome: string;
  nomeCompleto: string;
  tipoId: number;
  tipoErudio: string;
  tipo: TipoUnidadeNutricao | null;
  bairro: string;
  etapasOfertadasIds: number[];
  ativo: boolean;
}

export interface ErudioEtapaRaw {
  id: number;
  nome: string;
  ordem: number;
  cursoId: number;
  curso: string;
}

export interface EtapaNutricao {
  erudioEtapaId: number;
  nome: string;
  ordem: number;
  cursoId: number;
  curso: string;
  faixaFnde: FaixaFnde | null;
}

export interface ErudioTurnoRaw {
  id: number;
  nome: string;
  inicio: string;
  termino: string;
  modalidade: ModalidadeTurno;
}

export interface TurnoNutricao {
  erudioTurnoId: number;
  nome: string;
  inicio: string;
  termino: string;
  modalidade: ModalidadeTurno;
}

/** Agregado já no formato de `GET /api/alimentacao/matriculas/quantidade`. */
export interface ContagemAlunosErudio {
  erudioUnidadeEnsinoId: number;
  nomeEscola: string;
  erudioEtapaId: number;
  erudioTurnoId: number;
  totalAlunosAtivos: number;
}

export interface MatriculaAlunoErudio {
  erudioMatriculaId: number;
  /** Identificador da pessoa; necessário para detectar contraturno (2 unidades no mesmo dia). */
  erudioAlunoId?: number | null;
  codigo: string;
  nomeAluno: string;
  erudioUnidadeEnsinoId: number;
  erudioEtapaId: number;
  erudioTurnoId: number;
  situacao: 'CURSANDO';
}

/**
 * `erudioUnidadeEnsinoId` null = calendário da SME (instituicao 16138).
 * `ehDiaLetivo` espelha `edu_calendario_dia.letivo` (1 = true).
 */
export interface CalendarioDiaErudioRaw {
  erudioUnidadeEnsinoId: number | null;
  data: string;
  ehDiaLetivo: boolean;
  tipoEvento: TipoEventoErudio;
  descricao?: string;
}

export interface CalendarioDiaNutricao {
  instituicaoId: number;
  erudioUnidadeEnsinoId: number | null;
  data: string;
  ehDiaLetivo: boolean;
  tipoEvento: TipoEventoErudio;
  tipoDiaCardapio: TipoDiaCardapioNutricao | null;
  descricao?: string;
}

export interface ErudioUsuarioRaw {
  id: number;
  nome: string;
  email: string | null;
  grupo: string;
  instituicaoId: number;
  crn: null;
}

export interface UsuarioNutricao {
  erudioUsuarioId: number;
  nome: string;
  email: string | null;
  grupo: string;
  perfil: PerfilUsuarioNutricao | null;
  instituicaoId: number;
  /** O Erudio não tem CRN. O valor vive no Mongo da nutrição. */
  crn: null;
}

export interface FiltroContagemAlunos {
  erudioUnidadeEnsinoId?: number;
  erudioEtapaId?: number;
  erudioTurnoId?: number;
}

export interface FiltroMatriculas {
  erudioUnidadeEnsinoId?: number;
}

export interface FiltroCalendario {
  /** Unidade escolar. Omitido ou null lê só a SME. */
  erudioUnidadeEnsinoId?: number | null;
  de?: string;
  ate?: string;
}

export interface FiltroUsuarios {
  grupo?: string;
}

export interface IErudioProvider {
  listarUnidades(): Promise<UnidadeEnsinoNutricao[]>;
  listarEtapas(): Promise<EtapaNutricao[]>;
  listarTurnos(): Promise<TurnoNutricao[]>;
  listarContagemAlunos(filtro?: FiltroContagemAlunos): Promise<ContagemAlunosErudio[]>;
  listarMatriculas(filtro?: FiltroMatriculas): Promise<MatriculaAlunoErudio[]>;
  listarCalendario(filtro?: FiltroCalendario): Promise<CalendarioDiaNutricao[]>;
  listarUsuarios(filtro?: FiltroUsuarios): Promise<UsuarioNutricao[]>;
}

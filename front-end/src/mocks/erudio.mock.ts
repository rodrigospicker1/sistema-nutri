/**
 * Espelho de `back-end/src/integrations/erudio`.
 * Contrato: `docs/INTEGRACAO_ERUDIO_MOCKS.md`.
 * Componentes leem estes dados só por `useErudioMock`.
 */

export const ERUDIO_SME_INSTITUICAO_ID = 16138

export type TipoUnidadeNutricao = 'CEI' | 'ESCOLA_BASICA'
export type FaixaFnde = 'EDUCACAO_INFANTIL' | 'FUNDAMENTAL_I' | 'FUNDAMENTAL_II'
export type ModalidadeTurno = 'PARCIAL' | 'INTEGRAL'
export type TipoEventoErudio = 'FERIADO' | 'RECESSO' | 'ATIVIDADE_ADMINISTRATIVA' | 'ATIVIDADE_ESCOLAR'
export type TipoDiaCardapioNutricao = 'LETIVO' | 'FERIADO' | 'REUNIAO_PEDAGOGICA' | 'RECESSO'
export type PerfilUsuarioNutricao = 'NUTRICIONISTA' | 'FISCAL_ALIMENTACAO' | 'ALIMENTACAO'

export interface UnidadeEnsinoNutricao {
  erudioUnidadeEnsinoId: number
  nome: string
  nomeCompleto: string
  tipoId: number
  tipoErudio: string
  tipo: TipoUnidadeNutricao | null
  bairro: string
  etapasOfertadasIds: number[]
  ativo: boolean
}

export interface EtapaNutricao {
  erudioEtapaId: number
  nome: string
  ordem: number
  cursoId: number
  curso: string
  faixaFnde: FaixaFnde | null
}

export interface TurnoNutricao {
  erudioTurnoId: number
  nome: string
  inicio: string
  termino: string
  modalidade: ModalidadeTurno
}

export interface ContagemAlunosErudio {
  erudioUnidadeEnsinoId: number
  erudioEtapaId: number
  erudioTurnoId: number
  totalAlunosAtivos: number
}

export interface MatriculaAlunoErudio {
  erudioMatriculaId: number
  codigo: string
  nomeAluno: string
  erudioUnidadeEnsinoId: number
  erudioEtapaId: number
  erudioTurnoId: number
  situacao: 'CURSANDO'
}

export interface CalendarioDiaNutricao {
  instituicaoId: number
  erudioUnidadeEnsinoId: number | null
  data: string
  ehDiaLetivo: boolean
  tipoEvento: TipoEventoErudio
  tipoDiaCardapio: TipoDiaCardapioNutricao | null
  descricao?: string
}

export interface UsuarioNutricao {
  erudioUsuarioId: number
  nome: string
  email: string | null
  grupo: string
  perfil: PerfilUsuarioNutricao | null
  instituicaoId: number
  crn: null
}

interface UnidadeRaw {
  id: number
  nome: string
  nomeCompleto: string
  tipoId: number
  tipo: string
  bairro: string
  etapasOfertadasIds: number[]
  ativo: boolean
}

interface EtapaRaw {
  id: number
  nome: string
  ordem: number
  cursoId: number
  curso: string
}

interface CalendarioRaw {
  erudioUnidadeEnsinoId: number | null
  data: string
  ehDiaLetivo: boolean
  tipoEvento: TipoEventoErudio
  descricao?: string
}

function tipoUnidade(tipoId: number): TipoUnidadeNutricao | null {
  if (tipoId === 1) return 'CEI'
  if (tipoId === 4) return 'ESCOLA_BASICA'
  return null
}

function faixaFnde(etapa: Pick<EtapaRaw, 'id' | 'cursoId'>): FaixaFnde | null {
  if (etapa.cursoId === 11) return 'EDUCACAO_INFANTIL'
  if (etapa.cursoId === 10 && etapa.id >= 1 && etapa.id <= 5) return 'FUNDAMENTAL_I'
  if (etapa.cursoId === 10 && etapa.id >= 6 && etapa.id <= 9) return 'FUNDAMENTAL_II'
  return null
}

function perfil(grupo: string): PerfilUsuarioNutricao | null {
  if (grupo === 'NUTRICIONISTAS') return 'NUTRICIONISTA'
  if (grupo === 'Fiscal alimentação') return 'FISCAL_ALIMENTACAO'
  if (grupo === 'Alimentação') return 'ALIMENTACAO'
  return null
}

function tipoDia(dia: Pick<CalendarioRaw, 'ehDiaLetivo' | 'tipoEvento'>): TipoDiaCardapioNutricao | null {
  if (dia.ehDiaLetivo) return 'LETIVO'
  if (dia.tipoEvento === 'FERIADO') return 'FERIADO'
  if (dia.tipoEvento === 'RECESSO') return 'RECESSO'
  if (dia.tipoEvento === 'ATIVIDADE_ADMINISTRATIVA') return 'REUNIAO_PEDAGOGICA'
  return null
}

const unidadesRaw: UnidadeRaw[] = [
  {
    id: 16147,
    nome: 'ADÉLIA RUSSI SILVA',
    nomeCompleto: 'CENTRO DE EDUCAÇÃO INFANTIL ADÉLIA RUSSI SILVA',
    tipoId: 1,
    tipo: 'CENTRO DE EDUCAÇÃO INFANTIL',
    bairro: 'DOM BOSCO',
    etapasOfertadasIds: [20, 21, 22, 23, 17, 18, 10],
    ativo: true,
  },
  {
    id: 16181,
    nome: 'DRA. ZILDA ARNS NEUMANN',
    nomeCompleto: 'CENTRO DE EDUCAÇÃO INFANTIL DRA. ZILDA ARNS NEUMANN',
    tipoId: 1,
    tipo: 'CENTRO DE EDUCAÇÃO INFANTIL',
    bairro: 'CIDADE NOVA',
    etapasOfertadasIds: [23, 17, 18, 10],
    ativo: true,
  },
  {
    id: 16171,
    nome: 'GASPAR DA COSTA MORAES',
    nomeCompleto: 'ESCOLA BÁSICA GASPAR DA COSTA MORAES',
    tipoId: 4,
    tipo: 'ESCOLA BÁSICA',
    bairro: 'FAZENDINHA',
    etapasOfertadasIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 26, 27],
    ativo: true,
  },
  {
    id: 16141,
    nome: 'ANÍBAL CÉSAR',
    nomeCompleto: 'ESCOLA BÁSICA ANÍBAL CÉSAR',
    tipoId: 4,
    tipo: 'ESCOLA BÁSICA',
    bairro: 'SÃO VICENTE',
    etapasOfertadasIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 24, 25, 26, 27],
    ativo: true,
  },
]

const etapasRaw: EtapaRaw[] = [
  { id: 20, nome: 'Berçário I', ordem: 1, cursoId: 11, curso: 'Educação Infantil' },
  { id: 21, nome: 'Berçário II', ordem: 2, cursoId: 11, curso: 'Educação Infantil' },
  { id: 22, nome: 'Maternal I', ordem: 3, cursoId: 11, curso: 'Educação Infantil' },
  { id: 23, nome: 'Maternal II', ordem: 4, cursoId: 11, curso: 'Educação Infantil' },
  { id: 17, nome: 'Jardim I', ordem: 5, cursoId: 11, curso: 'Educação Infantil' },
  { id: 18, nome: 'Jardim II', ordem: 6, cursoId: 11, curso: 'Educação Infantil' },
  { id: 10, nome: 'Pré', ordem: 7, cursoId: 11, curso: 'Educação Infantil' },
  { id: 1, nome: '1º Ano', ordem: 1, cursoId: 10, curso: 'Ensino Fundamental' },
  { id: 2, nome: '2º Ano', ordem: 2, cursoId: 10, curso: 'Ensino Fundamental' },
  { id: 3, nome: '3º Ano', ordem: 3, cursoId: 10, curso: 'Ensino Fundamental' },
  { id: 4, nome: '4º Ano', ordem: 4, cursoId: 10, curso: 'Ensino Fundamental' },
  { id: 5, nome: '5º Ano', ordem: 5, cursoId: 10, curso: 'Ensino Fundamental' },
  { id: 6, nome: '6º Ano', ordem: 6, cursoId: 10, curso: 'Ensino Fundamental' },
  { id: 7, nome: '7º Ano', ordem: 7, cursoId: 10, curso: 'Ensino Fundamental' },
  { id: 8, nome: '8º Ano', ordem: 8, cursoId: 10, curso: 'Ensino Fundamental' },
  { id: 9, nome: '9º Ano', ordem: 9, cursoId: 10, curso: 'Ensino Fundamental' },
]

const calendarioRaw: CalendarioRaw[] = [
  { erudioUnidadeEnsinoId: null, data: '2026-02-16', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Emenda de feriado' },
  { erudioUnidadeEnsinoId: null, data: '2026-02-17', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Carnaval' },
  { erudioUnidadeEnsinoId: null, data: '2026-04-03', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Sexta-feira Santa' },
  { erudioUnidadeEnsinoId: null, data: '2026-04-21', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Tiradentes' },
  { erudioUnidadeEnsinoId: null, data: '2026-05-01', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Dia do Trabalhador' },
  { erudioUnidadeEnsinoId: null, data: '2026-06-04', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Corpus Christi' },
  { erudioUnidadeEnsinoId: null, data: '2026-06-15', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Aniversário de Itajaí' },
  { erudioUnidadeEnsinoId: null, data: '2026-09-07', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Independência do Brasil' },
  { erudioUnidadeEnsinoId: null, data: '2026-10-12', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Padroeira do Brasil' },
  { erudioUnidadeEnsinoId: null, data: '2026-10-13', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Antecipação do Dia do Professor' },
  { erudioUnidadeEnsinoId: null, data: '2026-11-02', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Finados' },
  { erudioUnidadeEnsinoId: null, data: '2026-11-20', ehDiaLetivo: false, tipoEvento: 'FERIADO', descricao: 'Dia da Consciência Negra' },
  { erudioUnidadeEnsinoId: null, data: '2026-01-28', ehDiaLetivo: false, tipoEvento: 'ATIVIDADE_ADMINISTRATIVA', descricao: 'Reunião pedagógica com diretores' },
]

export const unidadesErudio: UnidadeEnsinoNutricao[] = unidadesRaw.map((raw) => ({
  erudioUnidadeEnsinoId: raw.id,
  nome: raw.nome,
  nomeCompleto: raw.nomeCompleto,
  tipoId: raw.tipoId,
  tipoErudio: raw.tipo,
  tipo: tipoUnidade(raw.tipoId),
  bairro: raw.bairro,
  etapasOfertadasIds: raw.etapasOfertadasIds,
  ativo: raw.ativo,
}))

export const etapasErudio: EtapaNutricao[] = etapasRaw.map((raw) => ({
  erudioEtapaId: raw.id,
  nome: raw.nome,
  ordem: raw.ordem,
  cursoId: raw.cursoId,
  curso: raw.curso,
  faixaFnde: faixaFnde(raw),
}))

export const turnosErudio: TurnoNutricao[] = [
  { erudioTurnoId: 1, nome: 'Matutino', inicio: '07:00:00', termino: '11:45:00', modalidade: 'PARCIAL' },
  { erudioTurnoId: 2, nome: 'Vespertino', inicio: '12:40:00', termino: '18:00:00', modalidade: 'PARCIAL' },
  { erudioTurnoId: 3, nome: 'Noturno', inicio: '19:00:00', termino: '23:00:00', modalidade: 'PARCIAL' },
  { erudioTurnoId: 4, nome: 'Integral', inicio: '07:00:00', termino: '19:00:00', modalidade: 'INTEGRAL' },
]

export const contagemAlunosErudio: ContagemAlunosErudio[] = [
  { erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', erudioEtapaId: 20, erudioTurnoId: 4, totalAlunosAtivos: 22 },
  { erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', erudioEtapaId: 21, erudioTurnoId: 4, totalAlunosAtivos: 15 },
  { erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', erudioEtapaId: 22, erudioTurnoId: 4, totalAlunosAtivos: 38 },
  { erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', erudioEtapaId: 17, erudioTurnoId: 4, totalAlunosAtivos: 49 },
  { erudioUnidadeEnsinoId: 16181, nomeEscola: 'DRA. ZILDA ARNS NEUMANN', erudioEtapaId: 17, erudioTurnoId: 4, totalAlunosAtivos: 65 },
  { erudioUnidadeEnsinoId: 16181, nomeEscola: 'DRA. ZILDA ARNS NEUMANN', erudioEtapaId: 18, erudioTurnoId: 4, totalAlunosAtivos: 95 },
  { erudioUnidadeEnsinoId: 16171, nomeEscola: 'GASPAR DA COSTA MORAES', erudioEtapaId: 1, erudioTurnoId: 4, totalAlunosAtivos: 27 },
  { erudioUnidadeEnsinoId: 16171, nomeEscola: 'GASPAR DA COSTA MORAES', erudioEtapaId: 6, erudioTurnoId: 1, totalAlunosAtivos: 68 },
  { erudioUnidadeEnsinoId: 16141, nomeEscola: 'ANÍBAL CÉSAR', erudioEtapaId: 1, erudioTurnoId: 1, totalAlunosAtivos: 46 },
  { erudioUnidadeEnsinoId: 16141, nomeEscola: 'ANÍBAL CÉSAR', erudioEtapaId: 8, erudioTurnoId: 1, totalAlunosAtivos: 128 },
]

export const matriculasErudio: MatriculaAlunoErudio[] = [
  { erudioMatriculaId: 153653, codigo: '20261100075', nomeAluno: 'AILEEN VASQUEZ MURILLO', erudioUnidadeEnsinoId: 16147, erudioEtapaId: 21, erudioTurnoId: 4, situacao: 'CURSANDO' },
  { erudioMatriculaId: 134363, codigo: '20241104508', nomeAluno: 'ALICE DE BARROS SILVA', erudioUnidadeEnsinoId: 16147, erudioEtapaId: 22, erudioTurnoId: 4, situacao: 'CURSANDO' },
  { erudioMatriculaId: 117707, codigo: '20231104253', nomeAluno: 'ÁGATHA LINHARES FELIPE', erudioUnidadeEnsinoId: 16147, erudioEtapaId: 17, erudioTurnoId: 4, situacao: 'CURSANDO' },
  { erudioMatriculaId: 158966, codigo: '20261003233', nomeAluno: 'AFONSO MIKAEL GOMES DOS SANTOS', erudioUnidadeEnsinoId: 16141, erudioEtapaId: 1, erudioTurnoId: 1, situacao: 'CURSANDO' },
  { erudioMatriculaId: 57919, codigo: '20191002696', nomeAluno: 'ADAM CAUÊ SANTOS CAVALCANTE', erudioUnidadeEnsinoId: 16141, erudioEtapaId: 8, erudioTurnoId: 1, situacao: 'CURSANDO' },
]

export const calendarioErudio: CalendarioDiaNutricao[] = calendarioRaw
  .map((raw) => ({
    instituicaoId: raw.erudioUnidadeEnsinoId ?? ERUDIO_SME_INSTITUICAO_ID,
    erudioUnidadeEnsinoId: raw.erudioUnidadeEnsinoId,
    data: raw.data,
    ehDiaLetivo: raw.ehDiaLetivo,
    tipoEvento: raw.tipoEvento,
    tipoDiaCardapio: tipoDia(raw),
    descricao: raw.descricao,
  }))
  .sort((a, b) => a.data.localeCompare(b.data))

export const usuariosErudio: UsuarioNutricao[] = [
  { erudioUsuarioId: 124799, nome: 'DAIANE RIOS PEREIRA', email: 'daianerios@live.com', grupo: 'NUTRICIONISTAS', perfil: perfil('NUTRICIONISTAS'), instituicaoId: 16138, crn: null },
  { erudioUsuarioId: 114250, nome: 'Fernanda Oliveira Ayala', email: null, grupo: 'NUTRICIONISTAS', perfil: perfil('NUTRICIONISTAS'), instituicaoId: 16138, crn: null },
  { erudioUsuarioId: 124797, nome: 'JAYNE LUIZA DOS SANTOS', email: 'jaayynee@gmail.com', grupo: 'NUTRICIONISTAS', perfil: perfil('NUTRICIONISTAS'), instituicaoId: 16138, crn: null },
  { erudioUsuarioId: 74431, nome: 'MEIRE CRISTIANE DE ASSIS DA SILVA', email: null, grupo: 'Alimentação', perfil: perfil('Alimentação'), instituicaoId: 16141, crn: null },
]

export function nomeUnidadeErudio(id: number): string {
  return unidadesErudio.find((unidade) => unidade.erudioUnidadeEnsinoId === id)?.nomeCompleto ?? `Unidade ${id}`
}

export function nomeEtapaErudio(id: number): string {
  return etapasErudio.find((etapa) => etapa.erudioEtapaId === id)?.nome ?? `Etapa ${id}`
}

export function diaErudioNaData(erudioUnidadeEnsinoId: number | null, data: string): CalendarioDiaNutricao | undefined {
  const daUnidade = calendarioErudio.find((dia) => dia.data === data && dia.erudioUnidadeEnsinoId === erudioUnidadeEnsinoId)
  if (daUnidade) return daUnidade
  if (erudioUnidadeEnsinoId == null || erudioUnidadeEnsinoId === ERUDIO_SME_INSTITUICAO_ID) return undefined
  return calendarioErudio.find((dia) => dia.data === data && dia.erudioUnidadeEnsinoId === null)
}

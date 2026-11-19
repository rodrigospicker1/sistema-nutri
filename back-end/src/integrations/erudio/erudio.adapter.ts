import { ERUDIO_SME_INSTITUICAO_ID, type CalendarioDiaErudioRaw, type CalendarioDiaNutricao, type ErudioEtapaRaw, type ErudioTurnoRaw, type ErudioUnidadeEnsinoRaw, type ErudioUsuarioRaw, type EtapaNutricao, type FaixaFnde, type PerfilUsuarioNutricao, type TipoDiaCardapioNutricao, type TipoUnidadeNutricao, type TurnoNutricao, type UnidadeEnsinoNutricao, type UsuarioNutricao } from './erudio.interfaces.js';

export function tipoUnidadeNutricao(tipoId: number): TipoUnidadeNutricao | null {
  if (tipoId === 1) return 'CEI';
  if (tipoId === 4) return 'ESCOLA_BASICA';
  return null;
}

export function faixaFndeDaEtapa(etapa: Pick<ErudioEtapaRaw, 'id' | 'cursoId'>): FaixaFnde | null {
  if (etapa.cursoId === 11) return 'EDUCACAO_INFANTIL';
  if (etapa.cursoId === 10 && etapa.id >= 1 && etapa.id <= 5) return 'FUNDAMENTAL_I';
  if (etapa.cursoId === 10 && etapa.id >= 6 && etapa.id <= 9) return 'FUNDAMENTAL_II';
  return null;
}

export function perfilDoGrupo(grupo: string): PerfilUsuarioNutricao | null {
  if (grupo === 'NUTRICIONISTAS') return 'NUTRICIONISTA';
  if (grupo === 'Fiscal alimentação') return 'FISCAL_ALIMENTACAO';
  if (grupo === 'Alimentação') return 'ALIMENTACAO';
  return null;
}

export function tipoDiaCardapio(dia: Pick<CalendarioDiaErudioRaw, 'ehDiaLetivo' | 'tipoEvento'>): TipoDiaCardapioNutricao | null {
  if (dia.ehDiaLetivo) return 'LETIVO';
  if (dia.tipoEvento === 'FERIADO') return 'FERIADO';
  if (dia.tipoEvento === 'RECESSO') return 'RECESSO';
  if (dia.tipoEvento === 'ATIVIDADE_ADMINISTRATIVA') return 'REUNIAO_PEDAGOGICA';
  return null;
}

export function adaptarUnidade(raw: ErudioUnidadeEnsinoRaw): UnidadeEnsinoNutricao {
  return {
    erudioUnidadeEnsinoId: raw.id,
    nome: raw.nome,
    nomeCompleto: raw.nomeCompleto,
    tipoId: raw.tipoId,
    tipoErudio: raw.tipo,
    tipo: tipoUnidadeNutricao(raw.tipoId),
    bairro: raw.bairro,
    etapasOfertadasIds: raw.etapasOfertadasIds,
    ativo: raw.ativo,
  };
}

export function adaptarEtapa(raw: ErudioEtapaRaw): EtapaNutricao {
  return {
    erudioEtapaId: raw.id,
    nome: raw.nome,
    ordem: raw.ordem,
    cursoId: raw.cursoId,
    curso: raw.curso,
    faixaFnde: faixaFndeDaEtapa(raw),
  };
}

export function adaptarTurno(raw: ErudioTurnoRaw): TurnoNutricao {
  return {
    erudioTurnoId: raw.id,
    nome: raw.nome,
    inicio: raw.inicio,
    termino: raw.termino,
    modalidade: raw.modalidade,
  };
}

export function adaptarCalendario(raw: CalendarioDiaErudioRaw): CalendarioDiaNutricao {
  const instituicaoId = raw.erudioUnidadeEnsinoId ?? ERUDIO_SME_INSTITUICAO_ID;
  return {
    instituicaoId,
    erudioUnidadeEnsinoId: raw.erudioUnidadeEnsinoId,
    data: raw.data,
    ehDiaLetivo: raw.ehDiaLetivo,
    tipoEvento: raw.tipoEvento,
    tipoDiaCardapio: tipoDiaCardapio(raw),
    descricao: raw.descricao,
  };
}

export function adaptarUsuario(raw: ErudioUsuarioRaw): UsuarioNutricao {
  return {
    erudioUsuarioId: raw.id,
    nome: raw.nome,
    email: raw.email,
    grupo: raw.grupo,
    perfil: perfilDoGrupo(raw.grupo),
    instituicaoId: raw.instituicaoId,
    crn: null,
  };
}

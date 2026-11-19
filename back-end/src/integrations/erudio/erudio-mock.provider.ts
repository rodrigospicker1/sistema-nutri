import { Injectable } from '@nestjs/common';
import { adaptarCalendario, adaptarEtapa, adaptarTurno, adaptarUnidade, adaptarUsuario } from './erudio.adapter.js';
import { erudioCalendarioRaw, erudioContagemAlunosRaw, erudioEtapasRaw, erudioMatriculasRaw, erudioTurnosRaw, erudioUnidadesRaw, erudioUsuariosRaw } from './erudio-mock.data.js';
import { ERUDIO_SME_INSTITUICAO_ID, type CalendarioDiaNutricao, type ContagemAlunosErudio, type EtapaNutricao, type FiltroCalendario, type FiltroContagemAlunos, type FiltroMatriculas, type FiltroUsuarios, type IErudioProvider, type MatriculaAlunoErudio, type TurnoNutricao, type UnidadeEnsinoNutricao, type UsuarioNutricao } from './erudio.interfaces.js';

@Injectable()
export class ErudioMockProvider implements IErudioProvider {
  async listarUnidades(): Promise<UnidadeEnsinoNutricao[]> {
    return erudioUnidadesRaw.map(adaptarUnidade);
  }

  async listarEtapas(): Promise<EtapaNutricao[]> {
    return erudioEtapasRaw.map(adaptarEtapa);
  }

  async listarTurnos(): Promise<TurnoNutricao[]> {
    return erudioTurnosRaw.map(adaptarTurno);
  }

  async listarContagemAlunos(filtro: FiltroContagemAlunos = {}): Promise<ContagemAlunosErudio[]> {
    return erudioContagemAlunosRaw.filter((linha) => {
      if (filtro.erudioUnidadeEnsinoId !== undefined && linha.erudioUnidadeEnsinoId !== filtro.erudioUnidadeEnsinoId) return false;
      if (filtro.erudioEtapaId !== undefined && linha.erudioEtapaId !== filtro.erudioEtapaId) return false;
      if (filtro.erudioTurnoId !== undefined && linha.erudioTurnoId !== filtro.erudioTurnoId) return false;
      return true;
    });
  }

  async listarMatriculas(filtro: FiltroMatriculas = {}): Promise<MatriculaAlunoErudio[]> {
    if (filtro.erudioUnidadeEnsinoId === undefined) return erudioMatriculasRaw;
    return erudioMatriculasRaw.filter((linha) => linha.erudioUnidadeEnsinoId === filtro.erudioUnidadeEnsinoId);
  }

  async listarCalendario(filtro: FiltroCalendario = {}): Promise<CalendarioDiaNutricao[]> {
    const unidade = filtro.erudioUnidadeEnsinoId;
    const porData = new Map<string, CalendarioDiaNutricao>();

    for (const raw of erudioCalendarioRaw) {
      const daSme = raw.erudioUnidadeEnsinoId === null;
      const daUnidade = unidade != null && unidade !== ERUDIO_SME_INSTITUICAO_ID && raw.erudioUnidadeEnsinoId === unidade;
      const soRede = unidade == null || unidade === ERUDIO_SME_INSTITUICAO_ID;
      if (soRede ? !daSme : !(daSme || daUnidade)) continue;
      if (filtro.de && raw.data < filtro.de) continue;
      if (filtro.ate && raw.data > filtro.ate) continue;

      const dia = adaptarCalendario(raw);
      const atual = porData.get(dia.data);
      if (!atual || dia.erudioUnidadeEnsinoId !== null) porData.set(dia.data, dia);
    }

    return [...porData.values()].sort((a, b) => a.data.localeCompare(b.data));
  }

  async listarUsuarios(filtro: FiltroUsuarios = {}): Promise<UsuarioNutricao[]> {
    const usuarios = erudioUsuariosRaw.map(adaptarUsuario);
    if (!filtro.grupo) return usuarios;
    return usuarios.filter((usuario) => usuario.grupo === filtro.grupo);
  }
}

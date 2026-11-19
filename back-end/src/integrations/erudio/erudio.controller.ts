import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ERUDIO_PROVIDER,
  type CalendarioDiaNutricao,
  type ContagemAlunosErudio,
  type EtapaNutricao,
  type FiltroCalendario,
  type FiltroContagemAlunos,
  type FiltroMatriculas,
  type FiltroUsuarios,
  type IErudioProvider,
  type MatriculaAlunoErudio,
  type TurnoNutricao,
  type UnidadeEnsinoNutricao,
  type UsuarioNutricao,
} from './erudio.interfaces.js';

function numeroOuUndefined(valor: string | undefined): number | undefined {
  if (valor === undefined || valor === '') return undefined;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

@ApiTags('Erudio')
@Controller('erudio')
export class ErudioController {
  constructor(@Inject(ERUDIO_PROVIDER) private readonly provider: IErudioProvider) {}

  @Get('unidades')
  @ApiOperation({ summary: 'Lista unidades de ensino do Erudio' })
  listarUnidades(): Promise<UnidadeEnsinoNutricao[]> {
    return this.provider.listarUnidades();
  }

  @Get('etapas')
  @ApiOperation({ summary: 'Lista etapas de ensino do Erudio' })
  listarEtapas(): Promise<EtapaNutricao[]> {
    return this.provider.listarEtapas();
  }

  @Get('turnos')
  @ApiOperation({ summary: 'Lista turnos do Erudio' })
  listarTurnos(): Promise<TurnoNutricao[]> {
    return this.provider.listarTurnos();
  }

  @Get('contagem-alunos')
  @ApiOperation({ summary: 'Contagem de alunos ativos por unidade/etapa/turno' })
  listarContagemAlunos(
    @Query('erudioUnidadeEnsinoId') unidade?: string,
    @Query('erudioEtapaId') etapa?: string,
    @Query('erudioTurnoId') turno?: string,
  ): Promise<ContagemAlunosErudio[]> {
    const filtro: FiltroContagemAlunos = {
      erudioUnidadeEnsinoId: numeroOuUndefined(unidade),
      erudioEtapaId: numeroOuUndefined(etapa),
      erudioTurnoId: numeroOuUndefined(turno),
    };
    return this.provider.listarContagemAlunos(filtro);
  }

  @Get('matriculas')
  @ApiOperation({ summary: 'Lista matrículas de alunos' })
  listarMatriculas(@Query('erudioUnidadeEnsinoId') unidade?: string): Promise<MatriculaAlunoErudio[]> {
    const filtro: FiltroMatriculas = { erudioUnidadeEnsinoId: numeroOuUndefined(unidade) };
    return this.provider.listarMatriculas(filtro);
  }

  @Get('calendario')
  @ApiOperation({ summary: 'Calendario letivo/feriados por data' })
  listarCalendario(
    @Query('erudioUnidadeEnsinoId') unidade?: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
  ): Promise<CalendarioDiaNutricao[]> {
    const filtro: FiltroCalendario = {
      erudioUnidadeEnsinoId: unidade === undefined ? undefined : unidade === '' ? null : numeroOuUndefined(unidade) ?? null,
      de,
      ate,
    };
    return this.provider.listarCalendario(filtro);
  }

  @Get('usuarios')
  @ApiOperation({ summary: 'Lista usuários do Erudio' })
  listarUsuarios(@Query('grupo') grupo?: string): Promise<UsuarioNutricao[]> {
    const filtro: FiltroUsuarios = { grupo };
    return this.provider.listarUsuarios(filtro);
  }
}

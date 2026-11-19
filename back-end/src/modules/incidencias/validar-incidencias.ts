import { TipoAlvoIncidencia } from '../../common/enums/index.js';

export interface ItemIncidencia {
  operador: 'E' | 'OU' | null;
  ativoParaCompra?: boolean;
  fichaTecnicaId?: string;
  alimentoId?: string;
}

export interface DiaIncidencia {
  numeroSemana?: number;
  tipoDia: string;
  refeicoes: { itens: ItemIncidencia[] }[];
}

export interface AlimentoIncidencia {
  id: string;
  nome: string;
  gruposIncidenciaIds: string[];
}

export interface FichaIncidencia {
  id: string;
  nome: string;
  gruposIncidenciaIds: string[];
  ingredientes: { alimentoId: string }[];
}

export interface RegraIncidenciaCalculo {
  id?: string;
  tipoAlvo: TipoAlvoIncidencia;
  grupoIncidenciaId: string | null;
  fichaTecnicaId: string | null;
  alimentoId: string | null;
  periodo: 'SEMANAL' | 'MENSAL';
  frequenciaMinima: number | null;
  frequenciaMaxima: number | null;
  origemRegra: string;
  alvoNome: string;
  categoriaVisual?: string;
}

export type StatusIncidencia = 'OK' | 'EXCESSO' | 'INSUFICIENTE' | 'PROIBIDO';

export interface AlertaIncidencia {
  tipo: 'EXCESSO' | 'INSUFICIENTE' | 'PROIBIDO';
  nivel: 'ERRO' | 'AVISO';
  numeroSemana?: number;
  alvoNome: string;
  origemRegra: string;
  atual: number;
  esperado: string;
  mensagem: string;
}

export interface LinhaRevisaoIncidencia {
  regraId?: string;
  tipoAlvo: TipoAlvoIncidencia;
  alvoNome: string;
  categoriaVisual: string;
  periodo: 'SEMANAL' | 'MENSAL';
  frequenciaMinima: number | null;
  frequenciaMaxima: number | null;
  metaRotulo: string;
  origemRegra: string;
  contagemMensal: number;
  contagemSemanas: Record<number, number>;
  statusMensal: StatusIncidencia;
  statusSemanas: Record<number, StatusIncidencia>;
}

export interface ResultadoIncidencia {
  valido: boolean;
  alertas: AlertaIncidencia[];
  revisao: LinhaRevisaoIncidencia[];
}

export function validarIncidencias(entrada: {
  dias: DiaIncidencia[];
  regras: RegraIncidenciaCalculo[];
  alimentos: AlimentoIncidencia[];
  fichas: FichaIncidencia[];
}): ResultadoIncidencia {
  const alimentos = new Map(entrada.alimentos.map((alimento) => [alimento.id, alimento]));
  const fichas = new Map(entrada.fichas.map((ficha) => [ficha.id, ficha]));
  const porSemana = new Map<number, Contagem>();
  const mes = contagemVazia();

  for (let semana = 1; semana <= 5; semana += 1) porSemana.set(semana, contagemVazia());

  for (const dia of entrada.dias) {
    if (dia.tipoDia !== 'LETIVO') continue;
    const semana = dia.numeroSemana && dia.numeroSemana >= 1 && dia.numeroSemana <= 5 ? dia.numeroSemana : 1;
    const destino = porSemana.get(semana) ?? contagemVazia();
    porSemana.set(semana, destino);
    for (const refeicao of dia.refeicoes) {
      for (const item of escolherItens(refeicao.itens)) {
        registrar(item, fichas, alimentos, destino);
        registrar(item, fichas, alimentos, mes);
      }
    }
  }

  const alertas: AlertaIncidencia[] = [];
  const revisao: LinhaRevisaoIncidencia[] = [];
  for (const regra of entrada.regras) {
    const contagemSemanas: Record<number, number> = {};
    const statusSemanas: Record<number, StatusIncidencia> = {};
  for (let semana = 1; semana <= 5; semana += 1) {
      const atual = contagemDaRegra(regra, porSemana.get(semana) ?? contagemVazia());
      contagemSemanas[semana] = atual;
      statusSemanas[semana] = statusContagem(atual, regra.frequenciaMinima, regra.frequenciaMaxima);
      if (regra.periodo === 'SEMANAL') {
        alertas.push(...alertasDaRegra(regra, atual, semana));
      }
    }
    const contagemMensal = contagemDaRegra(regra, mes);
    const statusMensal = statusContagem(contagemMensal, regra.frequenciaMinima, regra.frequenciaMaxima);
    if (regra.periodo === 'MENSAL') alertas.push(...alertasDaRegra(regra, contagemMensal));
    revisao.push({
      regraId: regra.id,
      tipoAlvo: regra.tipoAlvo,
      alvoNome: regra.alvoNome,
      categoriaVisual: regra.categoriaVisual ?? 'OUTROS',
      periodo: regra.periodo,
      frequenciaMinima: regra.frequenciaMinima,
      frequenciaMaxima: regra.frequenciaMaxima,
      metaRotulo: rotuloMeta(regra),
      origemRegra: regra.origemRegra,
      contagemMensal,
      contagemSemanas,
      statusMensal,
      statusSemanas,
    });
  }

  return { valido: alertas.every((alerta) => alerta.nivel !== 'ERRO'), alertas, revisao };
}

interface Contagem {
  grupos: Map<string, number>;
  alimentos: Map<string, number>;
  fichas: Map<string, number>;
}

function contagemVazia(): Contagem {
  return { grupos: new Map(), alimentos: new Map(), fichas: new Map() };
}

function escolherItens(itens: ItemIncidencia[]): ItemIncidencia[] {
  const grupos: ItemIncidencia[][] = [];
  for (const item of itens) {
    const ultimo = grupos.at(-1);
    if (!ultimo || item.operador !== 'OU') grupos.push([item]);
    else ultimo.push(item);
  }
  const escolhidos: ItemIncidencia[] = [];
  for (const grupo of grupos) {
    if (grupo.length === 1) {
      if (grupo[0].ativoParaCompra !== false) escolhidos.push(grupo[0]);
      continue;
    }
    escolhidos.push(...grupo.filter((item) => item.ativoParaCompra === true));
  }
  return escolhidos;
}

function registrar(
  item: ItemIncidencia,
  fichas: Map<string, FichaIncidencia>,
  alimentos: Map<string, AlimentoIncidencia>,
  destino: Contagem,
) {
  const fichaId = item.fichaTecnicaId;
  if (fichaId) {
    destino.fichas.set(fichaId, (destino.fichas.get(fichaId) ?? 0) + 1);
  }
  const alimentoIds = fichaId
    ? (fichas.get(fichaId)?.ingredientes.map((ingrediente) => ingrediente.alimentoId) ?? [])
    : item.alimentoId
      ? [item.alimentoId]
      : [];
  for (const id of alimentoIds) destino.alimentos.set(id, (destino.alimentos.get(id) ?? 0) + 1);

  const grupos = new Set<string>();
  if (fichaId) {
    for (const grupo of fichas.get(fichaId)?.gruposIncidenciaIds ?? []) grupos.add(grupo);
  }
  for (const id of alimentoIds) {
    for (const grupo of alimentos.get(id)?.gruposIncidenciaIds ?? []) grupos.add(grupo);
  }
  for (const grupo of grupos) destino.grupos.set(grupo, (destino.grupos.get(grupo) ?? 0) + 1);
}

function contagemDaRegra(regra: RegraIncidenciaCalculo, contagem: Contagem): number {
  if (regra.tipoAlvo === 'GRUPO' && regra.grupoIncidenciaId) return contagem.grupos.get(regra.grupoIncidenciaId) ?? 0;
  if (regra.tipoAlvo === 'FICHA_TECNICA' && regra.fichaTecnicaId) return contagem.fichas.get(regra.fichaTecnicaId) ?? 0;
  if (regra.tipoAlvo === 'ALIMENTO' && regra.alimentoId) return contagem.alimentos.get(regra.alimentoId) ?? 0;
  return 0;
}

export function statusContagem(atual: number, minimo: number | null, maximo: number | null): StatusIncidencia {
  if (maximo === 0 && atual > 0) return 'PROIBIDO';
  if (maximo != null && atual > maximo) return 'EXCESSO';
  if (minimo != null && atual < minimo) return 'INSUFICIENTE';
  return 'OK';
}

export function rotuloMeta(regra: Pick<RegraIncidenciaCalculo, 'periodo' | 'frequenciaMinima' | 'frequenciaMaxima'>): string {
  const sufixo = regra.periodo === 'SEMANAL' ? 'sem' : 'mês';
  if (regra.frequenciaMaxima === 0) return 'PROIBIDO';
  if (regra.frequenciaMinima != null && regra.frequenciaMaxima != null) {
    return `${regra.frequenciaMinima}-${regra.frequenciaMaxima}x ${sufixo}`;
  }
  if (regra.frequenciaMinima != null) return `mín. ${regra.frequenciaMinima}x ${sufixo}`;
  if (regra.frequenciaMaxima != null) return `máx. ${regra.frequenciaMaxima}x ${sufixo}`;
  return '—';
}

function alertasDaRegra(regra: RegraIncidenciaCalculo, atual: number, semana?: number): AlertaIncidencia[] {
  const status = statusContagem(atual, regra.frequenciaMinima, regra.frequenciaMaxima);
  if (status === 'OK') return [];
  const alertas: AlertaIncidencia[] = [];
  const origem = regra.origemRegra === 'CONTRATO_TERCEIRIZADA' ? 'contrato' : 'PNAE';
  const quando = semana ? ` (Semana ${semana})` : ' (mês)';
  const alvo = `'${regra.alvoNome}'`;

  if (status === 'PROIBIDO') {
    alertas.push({
      tipo: 'PROIBIDO',
      nivel: 'ERRO',
      numeroSemana: semana,
      alvoNome: regra.alvoNome,
      origemRegra: regra.origemRegra,
      atual,
      esperado: 'proibido',
      mensagem: `Alerta ${origem}${quando}: ${alvo} é proibido e foi ofertado ${atual} vez(es).`,
    });
    return alertas;
  }
  if (status === 'EXCESSO') {
    alertas.push({
      tipo: 'EXCESSO',
      nivel: 'ERRO',
      numeroSemana: semana,
      alvoNome: regra.alvoNome,
      origemRegra: regra.origemRegra,
      atual,
      esperado: `máximo ${regra.frequenciaMaxima}`,
      mensagem: `Alerta ${origem}${quando}: ${alvo} atingiu ${atual} ofertas (Máximo permitido: ${regra.frequenciaMaxima}).`,
    });
    return alertas;
  }
  const falta = (regra.frequenciaMinima ?? 0) - atual;
  const periodo = semana ? 'semanal' : 'mensal';
  alertas.push({
    tipo: 'INSUFICIENTE',
    nivel: 'AVISO',
    numeroSemana: semana,
    alvoNome: regra.alvoNome,
    origemRegra: regra.origemRegra,
    atual,
    esperado: `mínimo ${regra.frequenciaMinima}`,
    mensagem: `Faltam ${falta} oferta(s) de ${alvo} para atingir o mínimo ${periodo} de ${regra.frequenciaMinima}.`,
  });
  return alertas;
}
import type {
  Alimento,
  Cardapio,
  FichaTecnica,
  GrupoIncidencia,
  IncidenciaRegra,
  ItemGrade,
  StatusIncidencia,
  TipoAlvoIncidencia,
} from '../types/nutricao'

export interface AlertaIncidencia {
  tipo: 'EXCESSO' | 'INSUFICIENTE' | 'PROIBIDO'
  nivel: 'ERRO' | 'AVISO'
  numeroSemana?: number
  alvoNome: string
  origemRegra: string
  atual: number
  esperado: string
  mensagem: string
}

export interface LinhaRevisaoIncidencia {
  regraId: string
  tipoAlvo: TipoAlvoIncidencia
  alvoNome: string
  categoriaVisual: string
  periodo: 'SEMANAL' | 'MENSAL'
  frequenciaMinima: number | null
  frequenciaMaxima: number | null
  metaRotulo: string
  origemRegra: string
  contagemMensal: number
  contagemSemanas: Record<number, number>
  statusMensal: StatusIncidencia
  statusSemanas: Record<number, StatusIncidencia>
}

export interface ResultadoIncidencia {
  valido: boolean
  alertas: AlertaIncidencia[]
  revisao: LinhaRevisaoIncidencia[]
}

interface RegraCalculo {
  id: string
  tipoAlvo: TipoAlvoIncidencia
  grupoIncidenciaId: string | null
  fichaTecnicaId: string | null
  alimentoId: string | null
  periodo: 'SEMANAL' | 'MENSAL'
  frequenciaMinima: number | null
  frequenciaMaxima: number | null
  origemRegra: string
  alvoNome: string
  categoriaVisual: string
}

export function validarIncidenciasCardapio(entrada: {
  cardapio: Cardapio
  regras: IncidenciaRegra[]
  grupos: GrupoIncidencia[]
  alimentos: Alimento[]
  fichas: FichaTecnica[]
}): ResultadoIncidencia {
  const agrupamentoId = entrada.cardapio.agrupamentoCardapioId
  const alimentos = new Map(entrada.alimentos.map((alimento) => [alimento.id, alimento]))
  const fichas = new Map(entrada.fichas.map((ficha) => [ficha.id, ficha]))
  const porSemana = new Map<number, Contagem>()
  const mes = contagemVazia()
  for (let semana = 1; semana <= 5; semana += 1) porSemana.set(semana, contagemVazia())

  for (const dia of entrada.cardapio.dias) {
    if (dia.tipoDia !== 'LETIVO') continue
    const destino = porSemana.get(dia.numeroSemana) ?? contagemVazia()
    porSemana.set(dia.numeroSemana, destino)
    for (const refeicao of dia.refeicoes) {
      for (const item of escolherItens(refeicao.itens)) {
        registrar(item, fichas, alimentos, destino)
        registrar(item, fichas, alimentos, mes)
      }
    }
  }

  const regras = entrada.regras
    .filter((regra) => regra.ativo && regra.agrupamentoCardapioId === agrupamentoId)
    .map((regra) => mapRegra(regra, entrada.grupos, entrada.alimentos, entrada.fichas))

  const alertas: AlertaIncidencia[] = []
  const revisao: LinhaRevisaoIncidencia[] = []
  for (const regra of regras) {
    const contagemSemanas: Record<number, number> = {}
    const statusSemanas: Record<number, StatusIncidencia> = {}
    for (let semana = 1; semana <= 5; semana += 1) {
      const atual = contagemDaRegra(regra, porSemana.get(semana) ?? contagemVazia())
      contagemSemanas[semana] = atual
      statusSemanas[semana] = statusContagem(atual, regra.frequenciaMinima, regra.frequenciaMaxima)
      if (regra.periodo === 'SEMANAL') alertas.push(...alertasDaRegra(regra, atual, semana))
    }
    const contagemMensal = contagemDaRegra(regra, mes)
    const statusMensal = statusContagem(contagemMensal, regra.frequenciaMinima, regra.frequenciaMaxima)
    if (regra.periodo === 'MENSAL') alertas.push(...alertasDaRegra(regra, contagemMensal))
    revisao.push({
      regraId: regra.id,
      tipoAlvo: regra.tipoAlvo,
      alvoNome: regra.alvoNome,
      categoriaVisual: regra.categoriaVisual,
      periodo: regra.periodo,
      frequenciaMinima: regra.frequenciaMinima,
      frequenciaMaxima: regra.frequenciaMaxima,
      metaRotulo: rotuloMeta(regra),
      origemRegra: regra.origemRegra,
      contagemMensal,
      contagemSemanas,
      statusMensal,
      statusSemanas,
    })
  }

  return { valido: alertas.every((alerta) => alerta.nivel !== 'ERRO'), alertas, revisao }
}

function mapRegra(
  regra: IncidenciaRegra,
  grupos: GrupoIncidencia[],
  alimentos: Alimento[],
  fichas: FichaTecnica[],
): RegraCalculo {
  const grupo = grupos.find((item) => item.id === regra.grupoIncidenciaId)
  const alimento = alimentos.find((item) => item.id === regra.alimentoId)
  const ficha = fichas.find((item) => item.id === regra.fichaTecnicaId)
  const tipoAlvo = regra.tipoAlvo ?? (regra.grupoIncidenciaId ? 'GRUPO' : regra.alimentoId ? 'ALIMENTO' : 'FICHA_TECNICA')
  return {
    id: regra.id,
    tipoAlvo,
    grupoIncidenciaId: regra.grupoIncidenciaId,
    fichaTecnicaId: regra.fichaTecnicaId,
    alimentoId: regra.alimentoId,
    periodo: regra.periodo,
    frequenciaMinima: regra.frequenciaMinima,
    frequenciaMaxima: regra.frequenciaMaxima,
    origemRegra: grupo?.origemRegra ?? (regra.contratoTerceirizadaId ? 'CONTRATO_TERCEIRIZADA' : 'LEI_PNAE'),
    alvoNome: grupo?.nome ?? ficha?.nome ?? alimento?.nome ?? 'Item da regra',
    categoriaVisual: grupo?.categoriaVisual ?? 'OUTROS',
  }
}

interface Contagem {
  grupos: Map<string, number>
  alimentos: Map<string, number>
  fichas: Map<string, number>
}

function contagemVazia(): Contagem {
  return { grupos: new Map(), alimentos: new Map(), fichas: new Map() }
}

function escolherItens(itens: ItemGrade[]): ItemGrade[] {
  const grupos: ItemGrade[][] = []
  for (const item of itens) {
    const ultimo = grupos.at(-1)
    if (!ultimo || item.operador !== 'OU') grupos.push([item])
    else ultimo.push(item)
  }
  const escolhidos: ItemGrade[] = []
  for (const grupo of grupos) {
    if (grupo.length === 1) {
      if (grupo[0].ativoParaCompra !== false) escolhidos.push(grupo[0])
      continue
    }
    escolhidos.push(...grupo.filter((item) => item.ativoParaCompra === true))
  }
  return escolhidos
}

function registrar(item: ItemGrade, fichas: Map<string, FichaTecnica>, alimentos: Map<string, Alimento>, destino: Contagem) {
  const fichaId = item.origem === 'FICHA' ? item.fichaId : undefined
  if (fichaId) destino.fichas.set(fichaId, (destino.fichas.get(fichaId) ?? 0) + 1)
  const alimentoIds = fichaId
    ? (fichas.get(fichaId)?.ingredientes.map((ingrediente) => ingrediente.alimentoId) ?? [])
  : item.alimentoId
    ? [item.alimentoId]
    : []
  for (const id of alimentoIds) destino.alimentos.set(id, (destino.alimentos.get(id) ?? 0) + 1)
  const gruposTag = new Set<string>()
  if (fichaId) {
    for (const grupo of fichas.get(fichaId)?.gruposIncidenciaIds ?? []) gruposTag.add(grupo)
  }
  for (const id of alimentoIds) {
    for (const grupo of alimentos.get(id)?.gruposIncidenciaIds ?? []) gruposTag.add(grupo)
  }
  for (const grupo of gruposTag) destino.grupos.set(grupo, (destino.grupos.get(grupo) ?? 0) + 1)
}

function contagemDaRegra(regra: RegraCalculo, contagem: Contagem): number {
  if (regra.tipoAlvo === 'GRUPO' && regra.grupoIncidenciaId) return contagem.grupos.get(regra.grupoIncidenciaId) ?? 0
  if (regra.tipoAlvo === 'FICHA_TECNICA' && regra.fichaTecnicaId) return contagem.fichas.get(regra.fichaTecnicaId) ?? 0
  if (regra.tipoAlvo === 'ALIMENTO' && regra.alimentoId) return contagem.alimentos.get(regra.alimentoId) ?? 0
  return 0
}

function statusContagem(atual: number, minimo: number | null, maximo: number | null): StatusIncidencia {
  if (maximo === 0 && atual > 0) return 'PROIBIDO'
  if (maximo != null && atual > maximo) return 'EXCESSO'
  if (minimo != null && atual < minimo) return 'INSUFICIENTE'
  return 'OK'
}

function rotuloMeta(regra: Pick<RegraCalculo, 'periodo' | 'frequenciaMinima' | 'frequenciaMaxima'>): string {
  const sufixo = regra.periodo === 'SEMANAL' ? 'sem' : 'mês'
  if (regra.frequenciaMaxima === 0) return 'PROIBIDO'
  if (regra.frequenciaMinima != null && regra.frequenciaMaxima != null) return `${regra.frequenciaMinima}-${regra.frequenciaMaxima}x ${sufixo}`
  if (regra.frequenciaMinima != null) return `mín. ${regra.frequenciaMinima}x ${sufixo}`
  if (regra.frequenciaMaxima != null) return `máx. ${regra.frequenciaMaxima}x ${sufixo}`
  return '—'
}

function alertasDaRegra(regra: RegraCalculo, atual: number, semana?: number): AlertaIncidencia[] {
  const status = statusContagem(atual, regra.frequenciaMinima, regra.frequenciaMaxima)
  if (status === 'OK') return []
  const origem = regra.origemRegra === 'CONTRATO_TERCEIRIZADA' ? 'contrato' : 'PNAE'
  const quando = semana ? ` (Semana ${semana})` : ' (mês)'
  const alvo = `'${regra.alvoNome}'`
  if (status === 'PROIBIDO') {
    return [{
      tipo: 'PROIBIDO', nivel: 'ERRO', numeroSemana: semana, alvoNome: regra.alvoNome, origemRegra: regra.origemRegra,
      atual, esperado: 'proibido', mensagem: `Alerta ${origem}${quando}: ${alvo} é proibido e foi ofertado ${atual} vez(es).`,
    }]
  }
  if (status === 'EXCESSO') {
    return [{
      tipo: 'EXCESSO', nivel: 'ERRO', numeroSemana: semana, alvoNome: regra.alvoNome, origemRegra: regra.origemRegra,
      atual, esperado: `máximo ${regra.frequenciaMaxima}`,
      mensagem: `Alerta ${origem}${quando}: ${alvo} atingiu ${atual} ofertas (Máximo permitido: ${regra.frequenciaMaxima}).`,
    }]
  }
  const falta = (regra.frequenciaMinima ?? 0) - atual
  const periodo = semana ? 'semanal' : 'mensal'
  return [{
    tipo: 'INSUFICIENTE', nivel: 'AVISO', numeroSemana: semana, alvoNome: regra.alvoNome, origemRegra: regra.origemRegra,
    atual, esperado: `mínimo ${regra.frequenciaMinima}`,
    mensagem: `Faltam ${falta} oferta(s) de ${alvo} para atingir o mínimo ${periodo} de ${regra.frequenciaMinima}.`,
  }]
}

export const ROTULOS_CATEGORIA_VISUAL: Record<string, string> = {
  PROTEINA: 'Proteína',
  AMIDO: 'Amido',
  BEBIDAS: 'Bebidas',
  CEREAIS: 'Cereais',
  ACOMPANHAMENTO: 'Acompanhamento',
  PREPARACOES: 'Preparações',
  OUTROS: 'Outros',
}
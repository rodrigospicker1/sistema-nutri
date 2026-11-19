import {
  composicaoVazia,
  copiar,
  etapas,
  fatorCorrecao,
  META_AGRICULTURA_FAMILIAR,
  mediaComposicao,
  nutricaoItens,
  OBSERVACOES_COZINHA_PADRAO,
  safraPadrao,
  VALOR_PRESTACAO_SERVICO_EXTERNA,
  valorContratado,
} from '../../src/mocks/nutricao.mock'
import type { AlocacaoAlimento, ResultadoRomaneio } from '../../src/mocks/calcular-romaneio'
import { REFEICOES } from '../../src/types/nutricao'
import type {
  AgrupamentoCardapio,
  Alimento,
  Cardapio,
  ContratoHorti,
  DiaGrade,
  Empenho,
  EventoContrato,
  FaixaPnae,
  FichaTecnica,
  GrupoIncidencia,
  IncidenciaRegra,
  ItemGrade,
  ItemHortifruti,
  RefeicaoId,
  RegraRefeicaoTurno,
  TipoDia,
  TipoRefeicao,
  UnidadeMedida,
} from '../../src/types/nutricao'

function novoId(prefixo: string): string {
  return `${prefixo}-${Math.random().toString(36).slice(2, 8)}`
}

export interface NovoCardapioModeloInput {
  nome: string
  ano?: number
  agrupamentoCardapioId: string
  quantidadeSemanas: 1 | 2 | 3 | 4 | 5
  refeicoes: RefeicaoId[]
  observacoesCozinha: string
  nutricionistasResponsaveisIds: number[]
}

export interface AlteracaoItemInput {
  tipoEvento: EventoContrato['tipoEvento']
  numeroDocumento: string
  dataVigencia: string
  alimentoId: string
  motivo: string
  autorUsuarioId: string
  unidadeMedida?: UnidadeMedida
  valorNovo?: number
  qtdNova?: number
  perCapita?: number | null
  fatorCorrecao?: number | null
  diasSemanaEntrega?: number[]
}

interface DocApi {
  _id?: string
  id?: string
  __v?: number
  [chave: string]: unknown
}

let apiBaseUrl = 'http://localhost:3000'

function configurarApiBase() {
  const config = useRuntimeConfig()
  apiBaseUrl = String(config.public.apiBase ?? apiBaseUrl)
}

async function api<T>(caminho: string, opcoes?: Parameters<typeof $fetch>[1]): Promise<T> {
  return $fetch<T>(`${apiBaseUrl}${caminho}`, opcoes)
}

function normalizar<T>(doc: DocApi): T {
  const { _id, __v, ...resto } = doc
  return { ...(resto as object), id: (doc.id ?? _id) as string } as T
}

function normalizarLista<T>(docs: DocApi[]): T[] {
  return docs.map((doc) => normalizar<T>(doc))
}

function dataCurta(valor: unknown): string | undefined {
  if (typeof valor !== 'string' || !valor) return undefined
  return valor.slice(0, 10)
}

function normalizarCardapio(doc: DocApi): Cardapio {
  const cardapio = normalizar<Cardapio & { dias: Array<Record<string, unknown>> }>(doc)
  cardapio.dias = (cardapio.dias ?? []).map((dia) => ({
    ...dia,
    data: dataCurta(dia.data),
    refeicoes: (dia.refeicoes ?? []).map((refeicao) => ({
      ...refeicao,
      itens: (refeicao.itens ?? []).map((item) => {
        const { fichaTecnicaId, ...resto } = item as Record<string, unknown>
        return { ...resto, fichaId: fichaTecnicaId } as ItemGrade
      }),
    })),
  })) as Cardapio['dias']
  return cardapio
}

function corpoItemGrade(entrada: Omit<ItemGrade, 'id'>) {
  const { fichaId, ...resto } = entrada as ItemGrade & { fichaId?: string }
  return { ...resto, fichaTecnicaId: fichaId }
}

function mensagemErro(erro: unknown, padrao: string): string {
  const dados = (erro as { data?: { message?: unknown } })?.data
  const mensagem = dados?.message
  if (Array.isArray(mensagem)) return mensagem.join(' ')
  if (typeof mensagem === 'string') return mensagem
  return padrao
}

export function useNutricao() {
  configurarApiBase()
  const alimentos = useState<Alimento[]>('nutri-alimentos', () => [])
  const contratos = useState<ContratoHorti[]>('nutri-contratos-horti', () => [])
  const eventos = useState<EventoContrato[]>('nutri-eventos-horti', () => [])
  const empenhos = useState<Empenho[]>('nutri-empenhos-fonte', () => [])
  const fichas = useState<FichaTecnica[]>('nutri-fichas', () => [])
  const cardapios = useState<Cardapio[]>('nutri-cardapios-v2', () => [])
  const agrupamentos = useState<AgrupamentoCardapio[]>('nutri-agrupamentos', () => [])
  const referencias = useState<FaixaPnae[]>('nutri-referencias-pnae', () => [])
  const grupos = useState<GrupoIncidencia[]>('nutri-grupos', () => [])
  const regrasIncidencia = useState<IncidenciaRegra[]>('nutri-regras', () => [])
  const tiposRefeicao = useState<TipoRefeicao[]>('nutri-tipos-refeicao', () => [])
  const regrasRefeicao = useState<RegraRefeicaoTurno[]>('nutri-regras-refeicao', () => [])

  async function recarregar() {
    const [
      listaAlimentos,
      listaContratos,
      listaEmpenhos,
      listaFichas,
      listaCardapios,
      listaAgrupamentos,
      listaReferencias,
      listaGrupos,
      listaRegras,
      listaTiposRefeicao,
      listaRegrasRefeicao,
    ] = await Promise.all([
      api<DocApi[]>('/alimentos'),
      api<DocApi[]>('/contratos-horti'),
      api<DocApi[]>('/empenhos'),
      api<DocApi[]>('/fichas-tecnicas'),
      api<DocApi[]>('/cardapios'),
      api<DocApi[]>('/agrupamentos-cardapio'),
      api<DocApi[]>('/referencias-nutricionais-pnae'),
      api<DocApi[]>('/grupos-incidencia'),
      api<DocApi[]>('/incidencias-regras'),
      api<DocApi[]>('/tipos-refeicao'),
      api<DocApi[]>('/regras-refeicao'),
    ])

    alimentos.value = normalizarLista<Alimento>(listaAlimentos).map((alimento) => ({
      ...alimento,
      composicaoNutricional: { ...composicaoVazia(), ...alimento.composicaoNutricional },
    }))
    contratos.value = normalizarLista(listaContratos)
    empenhos.value = normalizarLista<Empenho>(listaEmpenhos)
    fichas.value = normalizarLista<FichaTecnica>(listaFichas)
    cardapios.value = listaCardapios.map(normalizarCardapio)
    agrupamentos.value = normalizarLista<AgrupamentoCardapio>(listaAgrupamentos)
    referencias.value = normalizarLista<FaixaPnae>(listaReferencias)
    grupos.value = normalizarLista<GrupoIncidencia>(listaGrupos)
    regrasIncidencia.value = normalizarLista<IncidenciaRegra>(listaRegras)
    tiposRefeicao.value = normalizarLista<TipoRefeicao>(listaTiposRefeicao).sort((a, b) => a.ordem - b.ordem)
    regrasRefeicao.value = normalizarLista<RegraRefeicaoTurno>(listaRegrasRefeicao)

    const historicos = await Promise.all(
      contratos.value.map((contrato) => api<DocApi[]>(`/contratos-horti/${contrato.id}/historico`)),
    )
    eventos.value = historicos.flat().map((doc) => normalizar<EventoContrato>(doc))
  }

  function substituir<T extends { id: string }>(lista: Ref<T[]>, item: T, inicio = false) {
    const indice = lista.value.findIndex((atual) => atual.id === item.id)
    if (indice >= 0) lista.value[indice] = item
    else if (inicio) lista.value.unshift(item)
    else lista.value.push(item)
  }

  async function salvarAlimento(alimento: Alimento) {
    const { id, ...corpo } = alimento
    const resposta = id && alimentos.value.some((item) => item.id === id)
      ? await api<DocApi>(`/alimentos/${id}`, { method: 'PATCH', body: corpo })
      : await api<DocApi>('/alimentos', { method: 'POST', body: corpo })
    substituir(alimentos, normalizar<Alimento>(resposta), true)
  }

  async function salvarFicha(ficha: FichaTecnica) {
    const { id, ...corpo } = ficha
    const resposta = id && fichas.value.some((item) => item.id === id)
      ? await api<DocApi>(`/fichas-tecnicas/${id}`, { method: 'PATCH', body: corpo })
      : await api<DocApi>('/fichas-tecnicas', { method: 'POST', body: corpo })
    substituir(fichas, normalizar<FichaTecnica>(resposta), true)
  }

  async function registrarAlteracao(contratoHortiId: string, entrada: AlteracaoItemInput): Promise<string | null> {
    try {
      const contratoApi = await api<DocApi>(`/contratos-horti/${contratoHortiId}/itens/alteracoes`, {
        method: 'POST',
        body: entrada,
      })
      substituir(contratos, normalizar(contratoApi))
      const historico = await api<DocApi[]>(`/contratos-horti/${contratoHortiId}/historico`)
      const novos = normalizarLista<EventoContrato>(historico)
      eventos.value = [...novos, ...eventos.value.filter((evento) => evento.contratoHortiId !== contratoHortiId)]
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível registrar a alteração.')
    }
  }

  async function salvarItensContrato(contratoHortiId: string, itens: ItemHortifruti[]): Promise<string | null> {
    try {
      const contratoApi = await api<DocApi>(`/contratos-horti/${contratoHortiId}/itens`, {
        method: 'PUT',
        body: { itens },
      })
      substituir(contratos, normalizar(contratoApi))
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível salvar os itens do contrato.')
    }
  }

  function jaEmpenhado(contratoHortiId: string, alimentoId: string) {
    return empenhos.value
      .filter((empenho) => empenho.ativo && empenho.contratoHortiId === contratoHortiId)
      .flatMap((empenho) => empenho.itensEmpenhados)
      .filter((item) => item.alimentoId === alimentoId)
      .reduce((soma, item) => soma + item.qtdEmpenhada, 0)
  }

  async function simularLista(
    contratoHortiId: string,
    datas: string[],
    gravar: boolean,
    alocacoes?: AlocacaoAlimento[],
  ): Promise<ResultadoRomaneio | string> {
    if (datas.length === 0) return 'Selecione ao menos uma data de consumo.'
    const corpo = {
      contratoHortiId,
      datasConsumo: datas.map((data) => new Date(`${data}T00:00:00.000Z`)),
      ...(alocacoes ? { alocacoes } : {}),
    }
    let resultado: ResultadoRomaneio
    try {
      resultado = await api<ResultadoRomaneio>('/listas-compras/simular', { method: 'POST', body: corpo })
    } catch (erro) {
      const dados = (erro as { data?: { itensPendentes?: ResultadoRomaneio['itensPendentes'] } })?.data
      if (dados?.itensPendentes) {
        return { datasConsideradas: [], datasIgnoradas: [], itensPendentes: dados.itensPendentes, consolidado: [], romaneio: [] }
      }
      return mensagemErro(erro, 'Não foi possível simular a lista de compras.')
    }
    if (gravar) {
      try {
        await api('/listas-compras/gerar', { method: 'POST', body: corpo })
      } catch (erro) {
        return mensagemErro(erro, 'A simulação passou, mas a lista não foi gravada.')
      }
    }
    return resultado
  }

  async function salvarTipoRefeicao(tipo: { id?: string; nome: string; ordem?: number; ativo?: boolean }): Promise<string | null> {
    try {
      const { id, ...corpo } = tipo
      const existente = id && tiposRefeicao.value.some((item) => item.id === id)
      const resposta = existente
        ? await api<DocApi>(`/tipos-refeicao/${id}`, { method: 'PATCH', body: corpo })
        : await api<DocApi>('/tipos-refeicao', { method: 'POST', body: corpo })
      substituir(tiposRefeicao, normalizar<TipoRefeicao>(resposta), true)
      tiposRefeicao.value.sort((a, b) => a.ordem - b.ordem)
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível salvar o tipo de refeição.')
    }
  }

  async function removerTipoRefeicao(id: string): Promise<string | null> {
    try {
      await api(`/tipos-refeicao/${id}`, { method: 'DELETE' })
      tiposRefeicao.value = tiposRefeicao.value.filter((item) => item.id !== id)
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível remover o tipo de refeição.')
    }
  }

  async function salvarMatrizRefeicao(
    regras: Array<{ erudioEtapaId: number; erudioTurnoId: number; erudioUnidadeEnsinoId?: number | null; refeicaoIds: string[] }>,
  ): Promise<string | null> {
    try {
      await api('/regras-refeicao/lote', { method: 'PUT', body: { regras } })
      const lista = await api<DocApi[]>('/regras-refeicao')
      regrasRefeicao.value = normalizarLista<RegraRefeicaoTurno>(lista)
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível salvar a matriz de refeições.')
    }
  }

  async function criarEmpenho(entrada: Omit<Empenho, 'id'>): Promise<string | null> {
    const { id: _id, itensEmpenhados, ...resto } = entrada
    try {
      const resposta = await api<DocApi>('/empenhos', {
        method: 'POST',
        body: {
          ...resto,
          itensEmpenhados: itensEmpenhados.map(({ qtdConsumida: _consumida, ...item }) => item),
        },
      })
      substituir(empenhos, normalizar<Empenho>(resposta), true)
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível registrar o empenho.')
    }
  }

  function saldoItem(contratoHortiId: string, alimentoId: string) {
    const contrato = contratos.value.find((item) => item.id === contratoHortiId)
    const item = contrato?.itens.find((atual) => atual.alimentoId === alimentoId)
    const empenhada = empenhos.value
      .filter((empenho) => empenho.contratoHortiId === contratoHortiId && empenho.ativo)
      .flatMap((empenho) => empenho.itensEmpenhados)
      .filter((atual) => atual.alimentoId === alimentoId)
      .reduce((soma, atual) => soma + atual.qtdEmpenhada, 0)
    const licitada = item?.qtdTotalLicitada ?? 0
    return { licitada, empenhada, disponivel: licitada - empenhada }
  }

  async function definirTipoDia(cardapioId: string, semana: number, diaSemana: number, tipoDia: TipoDia) {
    const resposta = await api<DocApi>(`/cardapios/${cardapioId}/dias/tipo`, {
      method: 'PATCH',
      body: { numeroSemana: semana, diaSemana, tipoDia },
    })
    substituir(cardapios, normalizarCardapio(resposta))
  }

  async function adicionarItemGrade(cardapioId: string, semana: number, diaSemana: number, refeicao: RefeicaoId, entrada: Omit<ItemGrade, 'id'>) {
    const resposta = await api<DocApi>(`/cardapios/${cardapioId}/dias/${semana}/${diaSemana}/refeicoes/${refeicao}/itens`, {
      method: 'POST',
      body: corpoItemGrade(entrada),
    })
    substituir(cardapios, normalizarCardapio(resposta))
  }

  async function removerItemGrade(cardapioId: string, semana: number, diaSemana: number, refeicao: RefeicaoId, itemId: string) {
    const resposta = await api<DocApi>(`/cardapios/${cardapioId}/dias/${semana}/${diaSemana}/refeicoes/${refeicao}/itens/${itemId}`, {
      method: 'DELETE',
    })
    substituir(cardapios, normalizarCardapio(resposta))
  }

  async function criarAgrupamento(nome: string, erudioEtapaIds: number[]): Promise<string | null> {
    const titulo = nome.trim()
    const etapasUnicas = [...new Set(erudioEtapaIds)]
    if (!titulo || etapasUnicas.length === 0) return null
    const resposta = await api<DocApi>('/agrupamentos-cardapio', {
      method: 'POST',
      body: { nome: titulo, erudioEtapaIds: etapasUnicas },
    })
    const agrupamento = normalizar<AgrupamentoCardapio>(resposta)
    substituir(agrupamentos, agrupamento, true)
    return agrupamento.id
  }

  async function criarCardapioModelo(entrada: NovoCardapioModeloInput): Promise<string | null> {
    const nome = entrada.nome.trim()
    const agrupamento = agrupamentos.value.find((item) => item.id === entrada.agrupamentoCardapioId && item.ativo)
    if (!nome || !agrupamento || entrada.refeicoes.length === 0) return null
    if (entrada.quantidadeSemanas < 1 || entrada.quantidadeSemanas > 5) return null
    const refeicoes = REFEICOES.map((refeicao) => refeicao.id).filter((id) => entrada.refeicoes.includes(id))
    const resposta = await api<DocApi>('/cardapios', {
      method: 'POST',
      body: {
        nome,
        ano: entrada.ano,
        agrupamentoCardapioId: agrupamento.id,
        quantidadeSemanas: entrada.quantidadeSemanas,
        refeicoes,
        observacoesCozinha: entrada.observacoesCozinha.trim() || OBSERVACOES_COZINHA_PADRAO,
        nutricionistasResponsaveisIds: [...entrada.nutricionistasResponsaveisIds],
      },
    })
    const cardapio = normalizarCardapio(resposta)
    substituir(cardapios, cardapio, true)
    return cardapio.id
  }

  async function salvarReferencia(faixa: FaixaPnae) {
    const { id, ...corpo } = faixa
    const existente = referencias.value.some((item) => item.id === id)
    const resposta = existente
      ? await api<DocApi>(`/referencias-nutricionais-pnae/${id}`, { method: 'PATCH', body: corpo })
      : await api<DocApi>('/referencias-nutricionais-pnae', { method: 'POST', body: corpo })
    substituir(referencias, normalizar<FaixaPnae>(resposta), true)
  }

  async function removerReferencia(id: string) {
    await api(`/referencias-nutricionais-pnae/${id}`, { method: 'DELETE' })
    referencias.value = referencias.value.filter((item) => item.id !== id)
  }

  async function definirStatus(cardapioId: string, status: Cardapio['status']) {
    const resposta = await api<DocApi>(`/cardapios/${cardapioId}`, { method: 'PATCH', body: { status } })
    substituir(cardapios, normalizarCardapio(resposta))
  }

  async function clonarModelo(modeloId: string, mes: number, ano: number): Promise<string | null> {
    const modelo = cardapios.value.find((item) => item.id === modeloId && item.tipo === 'MODELO')
    if (!modelo) return null
    const resposta = await api<DocApi>(`/cardapios/${modeloId}/clonar`, { method: 'POST', body: { mes, ano } })
    const cardapio = normalizarCardapio(resposta)
    substituir(cardapios, cardapio, true)
    return cardapio.id
  }

  function mediaSemanal(cardapio: Cardapio, semana: number) {
    const dias = cardapio.dias.filter((dia) => dia.numeroSemana === semana && dia.tipoDia === 'LETIVO')
    return { diasLetivos: dias.length, media: mediaComposicao(dias.map((dia) => somarDia(dia))) }
  }

  function somarDia(dia: DiaGrade) {
    const total = composicaoVazia()
    for (const refeicao of dia.refeicoes) {
      const parte = nutricaoItens(refeicao.itens, alimentos.value, fichas.value)
      for (const chave of Object.keys(total) as (keyof typeof total)[]) total[chave] += parte[chave]
    }
    return total
  }

  async function salvarGrupo(grupo: GrupoIncidencia) {
    const { id, ...corpo } = grupo
    const existente = grupos.value.some((item) => item.id === id)
    const resposta = existente
      ? await api<DocApi>(`/grupos-incidencia/${id}`, { method: 'PATCH', body: corpo })
      : await api<DocApi>('/grupos-incidencia', { method: 'POST', body: corpo })
    substituir(grupos, normalizar<GrupoIncidencia>(resposta), true)
  }

  async function salvarRegra(regra: IncidenciaRegra) {
    const { id, ...corpo } = regra
    const existente = regrasIncidencia.value.some((item) => item.id === id)
    const resposta = existente
      ? await api<DocApi>(`/incidencias-regras/${id}`, { method: 'PATCH', body: corpo })
      : await api<DocApi>('/incidencias-regras', { method: 'POST', body: corpo })
    substituir(regrasIncidencia, normalizar<IncidenciaRegra>(resposta), true)
  }

  const resumoFinanceiro = computed(() => {
    const ativos = empenhos.value.filter((empenho) => empenho.ativo)
    const valorEmpenhado = ativos
      .flatMap((empenho) => empenho.itensEmpenhados)
      .reduce((soma, item) => soma + item.qtdEmpenhada * item.valorUnitario, 0)
    const vigentes = contratos.value.filter((contrato) => contrato.ativo)
    const valorLicitado = vigentes.reduce((soma, contrato) => soma + valorContratado(contrato), 0)
    return {
      empenhosAtivos: ativos.length,
      valorEmpenhado,
      valorLicitado,
      saldo: valorLicitado - valorEmpenhado,
    }
  })

  const agriculturaFamiliar = computed(() => {
    const vigentes = contratos.value.filter((contrato) => contrato.ativo)
    const familiar = vigentes.filter((contrato) => contrato.agriculturaFamiliar).reduce((soma, contrato) => soma + valorContratado(contrato), 0)
    const total = vigentes.reduce((soma, contrato) => soma + valorContratado(contrato), 0) + VALOR_PRESTACAO_SERVICO_EXTERNA
    const percentual = total === 0 ? 0 : familiar / total
    return { total, familiar, percentual, meta: META_AGRICULTURA_FAMILIAR, atingiu: percentual >= META_AGRICULTURA_FAMILIAR }
  })

  return {
    alimentos,
    contratos,
    eventos,
    empenhos,
    fichas,
    cardapios,
    agrupamentos,
    grupos,
    regrasIncidencia,
    tiposRefeicao,
    regrasRefeicao,
    salvarTipoRefeicao,
    removerTipoRefeicao,
    salvarMatrizRefeicao,
    salvarGrupo,
    salvarRegra,
    etapas,
    referencias,
    fatorCorrecao,
    salvarAlimento,
    salvarFicha,
    registrarAlteracao,
    salvarItensContrato,
    criarEmpenho,
    simularLista,
    jaEmpenhado,
    saldoItem,
    definirTipoDia,
    adicionarItemGrade,
    removerItemGrade,
    definirStatus,
    criarAgrupamento,
    criarCardapioModelo,
    salvarReferencia,
    removerReferencia,
    clonarModelo,
    mediaSemanal,
    resumoFinanceiro,
    agriculturaFamiliar,
    novoId,
    composicaoVazia,
    safraPadrao,
    recarregar,
  }
}

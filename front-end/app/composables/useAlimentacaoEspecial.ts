import type {
  AdaptacaoPerfil,
  AdaptacaoOverride,
  ItemOverride,
  RestricoesAtivasResult,
  TipoRestricao,
} from '../../src/types/nutricao'

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

function normalizarAdaptacao(doc: DocApi): AdaptacaoPerfil {
  const adaptacao = normalizar<AdaptacaoPerfil>(doc)
  adaptacao.overrides = (adaptacao.overrides ?? []).map((override) => ({
    ...override,
    data: String(override.data).slice(0, 10),
  }))
  return adaptacao
}

function mensagemErro(erro: unknown, padrao: string): string {
  const dados = (erro as { data?: { message?: unknown } })?.data
  const mensagem = dados?.message
  if (Array.isArray(mensagem)) return mensagem.join(' ')
  if (typeof mensagem === 'string') return mensagem
  return padrao
}

/** Slug estável para o id da restrição (o backend exige id único). */
export function idRestricaoDe(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function useAlimentacaoEspecial() {
  configurarApiBase()
  const tiposRestricao = useState<TipoRestricao[]>('nutri-tipos-restricao', () => [])
  const adaptacoes = useState<AdaptacaoPerfil[]>('nutri-adaptacoes', () => [])
  const restricoesAtivas = useState<RestricoesAtivasResult>('nutri-restricoes-ativas', () => ({
    restricoes: [],
    alunosComMultiplasRestricoes: 0,
  }))
  const carregado = useState<boolean>('nutri-alim-especial-carregado', () => false)

  async function recarregar() {
    const [tipos, lista] = await Promise.all([
      api<DocApi[]>('/tipos-restricao'),
      api<DocApi[]>('/adaptacoes-cardapio'),
    ])
    tiposRestricao.value = normalizarLista<TipoRestricao>(tipos)
    adaptacoes.value = lista.map(normalizarAdaptacao)
    carregado.value = true
  }

  async function carregarRestricoesAtivas(erudioEtapaId: number) {
    const resultado = await api<RestricoesAtivasResult>(`/restricoes-ativas?erudioEtapaId=${erudioEtapaId}`)
    restricoesAtivas.value = resultado
    return resultado
  }

  async function cardapioConsolidado(adaptacaoId: string) {
    return api<{ adaptacao: AdaptacaoPerfil; cardapio: unknown }>(`/adaptacoes-cardapio/${adaptacaoId}/cardapio`)
  }

  async function salvarTipoRestricao(tipo: { id?: string; nome: string; ativo?: boolean }): Promise<string | null> {
    try {
      const { id, ...corpo } = tipo
      const resposta = id
        ? await api<DocApi>(`/tipos-restricao/${encodeURIComponent(id)}`, { method: 'PATCH', body: corpo })
        : await api<DocApi>('/tipos-restricao', {
            method: 'POST',
            body: { ...corpo, id: idRestricaoDe(corpo.nome) },
          })
      const salvo = normalizar<TipoRestricao>(resposta)
      const indice = tiposRestricao.value.findIndex((item) => item.id === salvo.id)
      if (indice >= 0) tiposRestricao.value[indice] = salvo
      else tiposRestricao.value.push(salvo)
      tiposRestricao.value.sort((a, b) => a.nome.localeCompare(b.nome))
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível salvar a restrição.')
    }
  }

  async function removerTipoRestricao(id: string): Promise<string | null> {
    try {
      await api(`/tipos-restricao/${encodeURIComponent(id)}`, { method: 'DELETE' })
      tiposRestricao.value = tiposRestricao.value.filter((item) => item.id !== id)
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível remover a restrição.')
    }
  }

  async function criarAdaptacao(entrada: {
    cardapioId: string
    nome: string
    prioridade?: number
    restricoesIds?: string[]
  }): Promise<{ id: string | null; erro: string | null }> {
    try {
      const resposta = await api<DocApi>('/adaptacoes-cardapio', { method: 'POST', body: entrada })
      const adaptacao = normalizarAdaptacao(resposta)
      adaptacoes.value = [...adaptacoes.value, { ...adaptacao, overrides: [] }].sort(
        (a, b) => a.prioridade - b.prioridade || a.nome.localeCompare(b.nome),
      )
      return { id: adaptacao.id, erro: null }
    } catch (erro) {
      return { id: null, erro: mensagemErro(erro, 'Não foi possível criar o perfil de adaptação.') }
    }
  }

  async function atualizarAdaptacao(
    id: string,
    entrada: { nome?: string; prioridade?: number; restricoesIds?: string[]; ativo?: boolean },
  ): Promise<string | null> {
    try {
      const resposta = await api<DocApi>(`/adaptacoes-cardapio/${id}`, { method: 'PATCH', body: entrada })
      const atualizado = normalizar<AdaptacaoPerfil>(resposta)
      const indice = adaptacoes.value.findIndex((item) => item.id === id)
      if (indice >= 0) {
        adaptacoes.value[indice] = { ...adaptacoes.value[indice]!, ...atualizado }
      }
      adaptacoes.value.sort((a, b) => a.prioridade - b.prioridade || a.nome.localeCompare(b.nome))
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível atualizar o perfil.')
    }
  }

  async function removerAdaptacao(id: string): Promise<string | null> {
    try {
      await api(`/adaptacoes-cardapio/${id}`, { method: 'DELETE' })
      adaptacoes.value = adaptacoes.value.filter((item) => item.id !== id)
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível remover o perfil.')
    }
  }

  /** PUT substitui TODO o conjunto de overrides — sempre enviar a lista completa. */
  async function salvarOverrides(id: string, overrides: AdaptacaoOverride[]): Promise<string | null> {
    try {
      const resposta = await api<DocApi[]>(`/adaptacoes-cardapio/${id}/overrides`, {
        method: 'PUT',
        body: {
          overrides: overrides.map((override) => ({
            data: override.data,
            refeicao: override.refeicao,
            itens: override.itens.map((item) => corpoItemOverride(item)),
          })),
        },
      })
      const lista = normalizarLista<AdaptacaoPerfil>(resposta).map(normalizarAdaptacao)
      for (const adaptacao of lista) {
        const indice = adaptacoes.value.findIndex((item) => item.id === adaptacao.id)
        if (indice >= 0) adaptacoes.value[indice] = adaptacao
      }
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível salvar os overrides.')
    }
  }

  async function removerOverride(id: string, data: string, refeicao: string): Promise<string | null> {
    try {
      const resposta = await api<DocApi[]>(`/adaptacoes-cardapio/${id}/overrides`, {
        method: 'DELETE',
        query: { data, refeicao },
      })
      const lista = normalizarLista<AdaptacaoPerfil>(resposta).map(normalizarAdaptacao)
      for (const adaptacao of lista) {
        const indice = adaptacoes.value.findIndex((item) => item.id === adaptacao.id)
        if (indice >= 0) adaptacoes.value[indice] = adaptacao
      }
      return null
    } catch (erro) {
      return mensagemErro(erro, 'Não foi possível restaurar a refeição herdada.')
    }
  }

  return {
    tiposRestricao,
    adaptacoes,
    restricoesAtivas,
    carregado,
    recarregar,
    carregarRestricoesAtivas,
    cardapioConsolidado,
    salvarTipoRestricao,
    removerTipoRestricao,
    criarAdaptacao,
    atualizarAdaptacao,
    removerAdaptacao,
    salvarOverrides,
    removerOverride,
  }
}

function corpoItemOverride(item: ItemOverride) {
  return {
    operador: item.operador ?? null,
    ativoParaCompra: item.ativoParaCompra ?? true,
    ...(item.fichaTecnicaId ? { fichaTecnicaId: item.fichaTecnicaId } : {}),
    ...(item.alimentoId ? { alimentoId: item.alimentoId } : {}),
    ...(item.perCapitaBruto !== undefined ? { perCapitaBruto: item.perCapitaBruto } : {}),
  }
}

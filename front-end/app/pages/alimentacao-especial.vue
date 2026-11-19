<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-serif text-3xl text-forest">Alimentação especial</h1>
        <p class="mt-1 text-sm text-ink/65">
          Perfis de adaptação herdam o cardápio principal e guardam só o que muda. Laudos deferidos viram restrições; restrições compatíveis podem dividir o mesmo perfil.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="botao-secundario" @click="restricoesAbertas = true">Gerenciar restrições</button>
        <button v-if="cardapioSel" type="button" class="botao-primario" @click="abrirPerfil()">+ Novo perfil</button>
      </div>
    </div>

    <section class="rounded-2xl border border-line bg-white p-4">
      <div class="flex flex-wrap items-end gap-3">
        <label class="block text-sm">
          Cardápio mensal
          <select v-model="cardapioId" class="campo mt-1 min-w-72">
            <option v-for="cardapio in cardapiosMensais" :key="cardapio.id" :value="cardapio.id">
              {{ cardapio.nome }} · {{ nomeMes(cardapio.mes ?? 0) }}/{{ cardapio.ano }} · {{ nomeEtapaCardapio(cardapio) }}
            </option>
          </select>
        </label>
        <label v-if="adaptacoesDoCardapio.length" class="block text-sm">
          Perfil de adaptação
          <select v-model="perfilId" class="campo mt-1 min-w-56">
            <option v-for="perfil in adaptacoesDoCardapio" :key="perfil.id" :value="perfil.id">
              {{ perfil.nome }}{{ perfil.ativo ? '' : ' (inativo)' }}
            </option>
          </select>
        </label>
        <template v-if="perfilSel">
          <span class="rounded-full bg-moss px-3 py-1 text-xs font-semibold text-forest">
            Prioridade {{ perfilSel.prioridade }}
          </span>
          <span v-for="restricaoId in perfilSel.restricoesIds" :key="restricaoId" class="rounded-full bg-cream px-3 py-1 text-xs text-ink/70">
            {{ nomeRestricao(restricaoId) }}
          </span>
          <button type="button" class="botao-secundario" @click="abrirPerfil(perfilSel)">Editar perfil</button>
          <button type="button" class="botao-secundario" @click="alternarAtivo(perfilSel)">
            {{ perfilSel.ativo ? 'Desativar' : 'Ativar' }}
          </button>
          <button type="button" class="botao-secundario text-clay" @click="confirmarRemoverPerfil(perfilSel)">Excluir</button>
        </template>
        <p v-else-if="cardapioSel && adaptacoesDoCardapio.length === 0" class="text-sm text-ink/60">
          Nenhum perfil para este cardápio. Crie um para começar a adaptar refeições.
        </p>
      </div>
    </section>

    <section v-if="restricoes.restricoes.length" class="rounded-2xl border border-line bg-white p-4">
      <h2 class="font-semibold text-forest">Restrições ativas na etapa</h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="restricao in restricoes.restricoes"
          :key="restricao.restricaoId"
          class="rounded-full bg-cream px-3 py-1 text-xs"
          :title="restricao.nome"
        >
          {{ restricao.nome }} · <strong>{{ restricao.alunosAtivos }}</strong> aluno(s)
        </span>
      </div>
      <p v-if="restricoes.alunosComMultiplasRestricoes > 0" class="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-ink">
        {{ restricoes.alunosComMultiplasRestricoes }} aluno(s) com mais de uma restrição. Se eles caírem em perfis diferentes, vale o de menor prioridade — avalie criar um perfil combinado.
      </p>
    </section>

    <section v-if="perfilSel && consolidado" class="overflow-x-auto rounded-2xl border border-line bg-white">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h2 class="font-semibold text-forest">
          {{ perfilSel.nome }} — cardápio consolidado
        </h2>
        <p class="text-xs text-ink/60">
          Células destacadas foram adaptadas; as demais são herdadas do cardápio principal. Clique em uma célula para editar a refeição daquele dia.
        </p>
      </div>
      <table class="w-full min-w-[60rem] border-collapse text-sm">
        <thead>
          <tr class="bg-cream">
            <th class="w-44 border-b border-line px-3 py-3 text-left">Dia</th>
            <th v-for="refeicao in refeicoesGrade" :key="refeicao" class="border-b border-l border-line px-2 py-2 text-left">
              {{ nomeRefeicao(refeicao) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dia in diasGrade" :key="dia.data" class="align-top">
            <th class="border-t border-line bg-paper px-3 py-3 text-left">
              <p class="font-semibold">{{ nomeDiaSemana(dia.diaSemana) }}</p>
              <p class="text-xs text-ink/50">{{ dia.data ? Number(dia.data.slice(8, 10)) : '' }}</p>
            </th>
            <td
              v-for="refeicao in refeicoesGrade"
              :key="`${dia.data}-${refeicao}`"
              class="border-t border-l border-line p-2"
              :class="celulaAdaptada(dia, refeicao) ? 'bg-honey-soft/50' : ''"
            >
              <template v-if="celulaLetiva(dia)">
                <ul class="space-y-1">
                  <li
                    v-for="(item, indice) in itensDa(dia, refeicao)"
                    :key="indice"
                    class="rounded-md bg-moss/70 px-2 py-1"
                  >
                    <strong v-if="item.operador" class="mr-1 text-leaf">{{ item.operador }}</strong>
                    {{ nomeItem(item) }}
                    <span v-if="item.perCapitaBruto || item.perCapitaLiquido" class="text-ink/55">
                      · {{ item.perCapitaBruto ?? item.perCapitaLiquido }} g
                    </span>
                  </li>
                </ul>
                <button type="button" class="mt-2 text-xs font-semibold text-leaf" @click="abrirCelula(dia, refeicao)">
                  {{ celulaAdaptada(dia, refeicao) ? 'Editar override' : 'Adaptar' }}
                </button>
              </template>
              <p v-else class="px-2 py-3 text-center text-xs font-semibold text-ink/45">
                {{ dia.tipoDia === 'LETIVO' ? '' : rotuloTipoDia(dia.tipoDia) }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else-if="!perfilSel" class="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-ink/60">
      Selecione ou crie um perfil de adaptação para ver o cardápio consolidado (principal + overrides).
    </section>

    <UiModal
      :aberto="perfilAberto"
      :titulo="perfilEditando ? 'Editar perfil' : 'Novo perfil de adaptação'"
      descricao="O perfil herda o cardápio principal e guarda só as refeições adaptadas. Vincule uma ou mais restrições para atender alunos com perfis compatíveis."
      @fechar="perfilAberto = false"
    >
      <form class="space-y-4" @submit.prevent="confirmarPerfil">
        <label class="block text-sm">
          Nome
          <input v-model="perfilDraft.nome" required class="campo mt-1" placeholder="Sem leite / APLV" />
        </label>
        <label class="block text-sm">
          Prioridade (menor vence quando o aluno cai em mais de um perfil)
          <input v-model.number="perfilDraft.prioridade" type="number" min="1" class="campo mt-1" />
        </label>
        <fieldset>
          <legend class="text-sm font-semibold">Restrições atendidas</legend>
          <div class="mt-2 flex flex-wrap gap-2">
            <label
              v-for="tipo in tiposRestricao.filter((item) => item.ativo)"
              :key="tipo.id"
              class="flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-xs"
            >
              <input
                type="checkbox"
                :checked="perfilDraft.restricoesIds.includes(tipo.id)"
                @change="alternarRestricaoPerfil(tipo.id)"
              />
              {{ tipo.nome }}
            </label>
            <p v-if="!tiposRestricao.length" class="text-xs text-ink/50">Cadastre restrições primeiro.</p>
          </div>
        </fieldset>
        <label v-if="perfilEditando" class="flex items-center gap-2 text-sm">
          <input v-model="perfilDraft.ativo" type="checkbox" /> Perfil ativo
        </label>
        <p v-if="erroPerfil" class="text-sm text-clay">{{ erroPerfil }}</p>
        <button type="submit" class="botao-primario">{{ perfilEditando ? 'Salvar' : 'Criar perfil' }}</button>
      </form>
    </UiModal>

    <UiModal :aberto="restricoesAbertas" titulo="Restrições alimentares" descricao="Catálogo usado pelos laudos e pelos perfis de adaptação." @fechar="restricoesAbertas = false">
      <div class="space-y-3">
        <div class="flex gap-2">
          <input v-model="novaRestricaoNome" class="campo flex-1" placeholder="Nova restrição (ex.: Intolerância à lactose)" />
          <button type="button" class="botao-primario" @click="adicionarRestricao">Adicionar</button>
        </div>
        <ul class="divide-y divide-line rounded-xl border border-line">
          <li v-for="tipo in tiposRestricao" :key="tipo.id" class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <div>
              <p class="font-medium">{{ tipo.nome }}</p>
              <p class="text-xs text-ink/50">{{ tipo.id }}</p>
            </div>
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-1 text-xs">
                <input type="checkbox" :checked="tipo.ativo" @change="alternarTipo(tipo)" /> Ativa
              </label>
              <button type="button" class="text-xs text-clay" @click="removerRestricao(tipo)">Excluir</button>
            </div>
          </li>
        </ul>
        <p v-if="erroRestricao" class="text-sm text-clay">{{ erroRestricao }}</p>
      </div>
    </UiModal>

    <UiModal
      :aberto="Boolean(celula)"
      :titulo="celula ? `${nomeDiaSemana(celula.dia.diaSemana)} · ${nomeRefeicao(celula.refeicao)}` : ''"
      :descricao="celulaAdaptada(celula?.dia ?? null, celula?.refeicao ?? '') ? 'Refeição adaptada — edite os itens ou restaure a herança do cardápio principal.' : 'A refeição inteira deste dia será substituída para este perfil. Sem override, o perfil herda o cardápio principal.'"
      @fechar="celula = null"
    >
      <form v-if="celula" class="space-y-4" @submit.prevent="confirmarOverride">
        <ul class="space-y-2">
          <li v-for="(item, indice) in overrideDraft" :key="indice" class="rounded-xl border border-line p-3">
            <div class="flex flex-wrap items-center gap-2">
              <select v-model="item.origem" class="campo w-auto">
                <option value="FICHA">Ficha técnica</option>
                <option value="ALIMENTO">Alimento</option>
              </select>
              <select v-if="indice > 0" v-model="item.operador" class="campo w-auto">
                <option :value="null">—</option>
                <option value="E">E</option>
                <option value="OU">OU</option>
              </select>
              <select v-if="item.origem === 'FICHA'" v-model="item.fichaId" class="campo flex-1">
                <option v-for="ficha in fichas" :key="ficha.id" :value="ficha.id">{{ ficha.nome }}</option>
              </select>
              <template v-else>
                <select v-model="item.alimentoId" class="campo flex-1">
                  <option v-for="alimento in alimentosCompra" :key="alimento.id" :value="alimento.id">{{ alimento.nome }}</option>
                </select>
                <input v-model.number="item.perCapitaBruto" type="number" min="1" step="1" class="campo w-28" placeholder="g" />
              </template>
              <button type="button" class="text-clay" :aria-label="`Remover item ${indice + 1}`" @click="overrideDraft.splice(indice, 1)">×</button>
            </div>
          </li>
        </ul>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="botao-secundario" @click="adicionarItemOverride">+ Item</button>
          <button
            v-if="celulaAdaptada(celula.dia, celula.refeicao)"
            type="button"
            class="botao-secundario text-clay"
            @click="restaurarHerdado"
          >
            Restaurar herdado
          </button>
        </div>
        <p v-if="erroOverride" class="text-sm text-clay">{{ erroOverride }}</p>
        <div class="flex gap-2">
          <button type="submit" class="botao-primario" :disabled="!overrideDraft.length">Salvar override</button>
          <button type="button" class="botao-secundario" @click="celula = null">Cancelar</button>
        </div>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { nomeEtapa, nomeMes, rotuloTipoDia } from '../../src/mocks/nutricao.mock'
import type {
  AdaptacaoPerfil,
  AdaptacaoOverride,
  Cardapio,
  DiaGrade,
  ItemGrade,
  ItemOverride,
  TipoRestricao,
} from '../../src/types/nutricao'
import { REFEICOES } from '../../src/types/nutricao'

const { cardapios, alimentos, fichas, contratos, tiposRefeicao } = useNutricao()
const {
  tiposRestricao,
  adaptacoes,
  restricoesAtivas: restricoes,
  recarregar,
  carregarRestricoesAtivas,
  cardapioConsolidado,
  criarAdaptacao,
  atualizarAdaptacao,
  removerAdaptacao,
  salvarTipoRestricao,
  removerTipoRestricao,
  salvarOverrides,
  removerOverride,
} = useAlimentacaoEspecial()

interface DiaConsolidado extends Omit<DiaGrade, 'refeicoes'> {
  data?: string
  refeicoes: Array<{ refeicao: string; itens: ItemGrade[]; adaptado?: boolean }>
}

interface ItemOverrideDraft {
  origem: 'FICHA' | 'ALIMENTO'
  operador: 'E' | 'OU' | null
  fichaId?: string
  alimentoId?: string
  perCapitaBruto?: number
}

const cardapioId = ref('')
const perfilId = ref('')
const consolidado = ref<{ adaptacao: AdaptacaoPerfil; cardapio: { dias: DiaConsolidado[] } } | null>(null)
const carregando = ref(false)

const perfilAberto = ref(false)
const perfilEditando = ref<AdaptacaoPerfil | null>(null)
const perfilDraft = reactive({ nome: '', prioridade: 1, restricoesIds: [] as string[], ativo: true })
const erroPerfil = ref('')

const restricoesAbertas = ref(false)
const novaRestricaoNome = ref('')
const erroRestricao = ref('')

const celula = ref<{ dia: DiaConsolidado; refeicao: string } | null>(null)
const overrideDraft = ref<ItemOverrideDraft[]>([])
const erroOverride = ref('')

const cardapiosMensais = computed(() =>
  cardapios.value
    .filter((cardapio) => cardapio.tipo === 'MENSAL')
    .sort((a, b) => (b.ano ?? 0) - (a.ano ?? 0) || (b.mes ?? 0) - (a.mes ?? 0) || a.nome.localeCompare(b.nome)),
)
const cardapioSel = computed<Cardapio | undefined>(() => cardapiosMensais.value.find((item) => item.id === cardapioId.value))
const adaptacoesDoCardapio = computed(() =>
  adaptacoes.value
    .filter((adaptacao) => adaptacao.cardapioId === cardapioId.value)
    .sort((a, b) => a.prioridade - b.prioridade || a.nome.localeCompare(b.nome)),
)
const perfilSel = computed(() => adaptacoesDoCardapio.value.find((item) => item.id === perfilId.value))

const diasGrade = computed<DiaConsolidado[]>(() => {
  const dias = consolidado.value?.cardapio.dias ?? []
  return [...dias]
    .filter((dia) => dia.data || dia.diaSemana)
    .sort((a, b) => String(a.data ?? '').localeCompare(String(b.data ?? '')) || a.numeroSemana - b.numeroSemana || a.diaSemana - b.diaSemana)
})

const refeicoesGrade = computed(() => {
  const presentes = new Set<string>()
  for (const dia of diasGrade.value) for (const refeicao of dia.refeicoes) presentes.add(refeicao.refeicao)
  const ordem = REFEICOES.map((refeicao) => refeicao.id as string)
  const extras = [...presentes].filter((id) => !ordem.includes(id))
  return [...ordem.filter((id) => presentes.has(id)), ...extras]
})

const tiposCompra = computed(() => tiposRestricao.value.filter((tipo) => tipo.ativo))
const alimentosCompra = computed(() => {
  const ids = new Set(
    contratos.value.flatMap((contrato) => contrato.itens.filter((item) => item.ativo).map((item) => item.alimentoId)),
  )
  return alimentos.value.filter((alimento) => ids.has(alimento.id))
})

watch(cardapiosMensais, (lista) => {
  if (!lista.some((item) => item.id === cardapioId.value)) cardapioId.value = lista[0]?.id ?? ''
}, { immediate: true })

watch(cardapioId, async (id) => {
  perfilId.value = adaptacoesDoCardapio.value[0]?.id ?? ''
  consolidado.value = null
  const cardapio = cardapiosMensais.value.find((item) => item.id === id)
  if (cardapio?.erudioEtapaId) await carregarRestricoesAtivas(cardapio.erudioEtapaId)
})

watch(adaptacoesDoCardapio, (lista) => {
  if (!lista.some((item) => item.id === perfilId.value)) perfilId.value = lista[0]?.id ?? ''
})

watch(perfilId, () => {
  void carregarConsolidado()
}, { immediate: true })

async function carregarConsolidado() {
  if (!perfilId.value) {
    consolidado.value = null
    return
  }
  carregando.value = true
  try {
    const resposta = await cardapioConsolidado(perfilId.value)
    consolidado.value = {
      adaptacao: resposta.adaptacao,
      cardapio: normalizarCardapioConsolidado(resposta.cardapio),
    }
  } catch {
    consolidado.value = null
  } finally {
    carregando.value = false
  }
}

onMounted(async () => {
  await recarregar()
})

function normalizarCardapioConsolidado(cardapio: { dias?: Array<Record<string, unknown>> }): { dias: DiaConsolidado[] } {
  return {
    dias: (cardapio.dias ?? []).map((dia) => ({
      ...dia,
      data: typeof dia.data === 'string' ? dia.data.slice(0, 10) : dia.data,
      refeicoes: ((dia.refeicoes as Array<Record<string, unknown>>) ?? []).map((refeicao) => ({
        refeicao: refeicao.refeicao as string,
        adaptado: Boolean(refeicao.adaptado),
        itens: ((refeicao.itens as Array<Record<string, unknown>>) ?? []).map((item) => ({
          ...item,
          fichaId: (item.fichaTecnicaId ?? item.fichaId) as string | undefined,
          origem: (item.fichaTecnicaId || item.fichaId ? 'FICHA' : 'ALIMENTO') as 'FICHA' | 'ALIMENTO',
          operador: (item.operador ?? null) as ItemGrade['operador'],
        })) as ItemGrade[],
      })),
    })) as DiaConsolidado[],
  }
}

function nomeEtapaCardapio(cardapio: Cardapio) {
  return nomeEtapa(cardapio.erudioEtapaId)
}

function nomeRestricao(id: string) {
  return tiposRestricao.value.find((tipo) => tipo.id === id)?.nome ?? id
}

function nomeRefeicao(id: string) {
  return REFEICOES.find((refeicao) => refeicao.id === id)?.nome ?? tiposRefeicao.value.find((tipo) => tipo.id === id)?.nome ?? id
}

function nomeDiaSemana(diaSemana: number) {
  return ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'][diaSemana] ?? ''
}

function celulaLetiva(dia: DiaConsolidado) {
  return dia.tipoDia === 'LETIVO' && Boolean(dia.data)
}

function refeicaoDa(dia: DiaConsolidado, refeicao: string) {
  return dia.refeicoes.find((item) => item.refeicao === refeicao)
}

function itensDa(dia: DiaConsolidado, refeicao: string): ItemGrade[] {
  return refeicaoDa(dia, refeicao)?.itens ?? []
}

function celulaAdaptada(dia: DiaConsolidado | null, refeicao: string) {
  if (!dia) return false
  return refeicaoDa(dia, refeicao)?.adaptado ?? false
}

function nomeItem(item: ItemGrade) {
  if (item.origem === 'FICHA') return fichas.value.find((ficha) => ficha.id === item.fichaId)?.nome ?? 'Ficha'
  return alimentos.value.find((alimento) => alimento.id === item.alimentoId)?.nome ?? 'Alimento'
}

// ---------- Perfis ----------

function abrirPerfil(perfil?: AdaptacaoPerfil) {
  erroPerfil.value = ''
  perfilEditando.value = perfil ?? null
  perfilDraft.nome = perfil?.nome ?? ''
  perfilDraft.prioridade = perfil?.prioridade ?? 1
  perfilDraft.restricoesIds = [...(perfil?.restricoesIds ?? [])]
  perfilDraft.ativo = perfil?.ativo ?? true
  perfilAberto.value = true
}

function alternarRestricaoPerfil(id: string) {
  if (perfilDraft.restricoesIds.includes(id)) perfilDraft.restricoesIds = perfilDraft.restricoesIds.filter((item) => item !== id)
  else perfilDraft.restricoesIds.push(id)
}

async function confirmarPerfil() {
  erroPerfil.value = ''
  if (!cardapioSel.value) return
  const corpo = {
    nome: perfilDraft.nome.trim(),
    prioridade: perfilDraft.prioridade || 1,
    restricoesIds: [...perfilDraft.restricoesIds],
    ativo: perfilDraft.ativo,
  }
  let novoId: string | null = null
  if (perfilEditando.value) {
    const erro = await atualizarAdaptacao(perfilEditando.value.id, corpo)
    if (erro) {
      erroPerfil.value = erro
      return
    }
  } else {
    const resultado = await criarAdaptacao({ cardapioId: cardapioSel.value.id, ...corpo })
    if (resultado.erro || !resultado.id) {
      erroPerfil.value = resultado.erro ?? 'Não foi possível criar o perfil.'
      return
    }
    novoId = resultado.id
  }
  perfilAberto.value = false
  if (novoId) perfilId.value = novoId
  await carregarConsolidado()
}

async function alternarAtivo(perfil: AdaptacaoPerfil) {
  await atualizarAdaptacao(perfil.id, { ativo: !perfil.ativo })
}

async function confirmarRemoverPerfil(perfil: AdaptacaoPerfil) {
  if (!window.confirm(`Remover o perfil "${perfil.nome}" e todos os seus overrides?`)) return
  const erro = await removerAdaptacao(perfil.id)
  if (erro) window.alert(erro)
}

// ---------- Restrições ----------

async function adicionarRestricao() {
  erroRestricao.value = ''
  if (!novaRestricaoNome.value.trim()) return
  const erro = await salvarTipoRestricao({ nome: novaRestricaoNome.value.trim() })
  if (erro) erroRestricao.value = erro
  else novaRestricaoNome.value = ''
}

async function alternarTipo(tipo: TipoRestricao) {
  await salvarTipoRestricao({ id: tipo.id, nome: tipo.nome, ativo: !tipo.ativo })
}

async function removerRestricao(tipo: TipoRestricao) {
  if (!window.confirm(`Remover a restrição "${tipo.nome}"?`)) return
  const erro = await removerTipoRestricao(tipo.id)
  if (erro) erroRestricao.value = erro
}

// ---------- Overrides ----------

function abrirCelula(dia: DiaConsolidado, refeicao: string) {
  celula.value = { dia, refeicao }
  erroOverride.value = ''
  const herdados = refeicaoDa(dia, refeicao)?.itens ?? []
  overrideDraft.value = herdados.map((item) => ({
    origem: item.origem === 'FICHA' ? 'FICHA' : 'ALIMENTO',
    operador: indiceOperador(herdados, item),
    fichaId: item.fichaId,
    alimentoId: item.alimentoId,
    perCapitaBruto: item.perCapitaBruto ?? item.perCapitaLiquido,
  }))
  if (overrideDraft.value.length === 0) adicionarItemOverride()
}

function indiceOperador(itens: ItemGrade[], alvo: ItemGrade): 'E' | 'OU' | null {
  const indice = itens.indexOf(alvo)
  if (indice <= 0) return null
  return alvo.operador ?? 'E'
}

function adicionarItemOverride() {
  overrideDraft.value.push({
    origem: 'FICHA',
    operador: overrideDraft.value.length > 0 ? 'E' : null,
    fichaId: fichas.value[0]?.id,
    perCapitaBruto: undefined,
  })
}

function paraOverrideItem(item: ItemOverrideDraft): ItemOverride {
  return {
    operador: item.operador,
    ativoParaCompra: true,
    fichaTecnicaId: item.origem === 'FICHA' ? item.fichaId : undefined,
    alimentoId: item.origem === 'ALIMENTO' ? item.alimentoId : undefined,
    perCapitaBruto: item.origem === 'ALIMENTO' ? item.perCapitaBruto : undefined,
  }
}

async function confirmarOverride() {
  if (!celula.value || !perfilSel.value) return
  erroOverride.value = ''
  const itens = overrideDraft.value
    .filter((item) => (item.origem === 'FICHA' ? item.fichaId : item.alimentoId) && (item.origem === 'FICHA' || (item.perCapitaBruto ?? 0) > 0))
    .map(paraOverrideItem)
  if (itens.length === 0) {
    erroOverride.value = 'Adicione ao menos um item ou restaure a refeição herdada.'
    return
  }
  const data = celula.value.dia.data
  if (!data) {
    erroOverride.value = 'O dia não possui data — não é possível criar override.'
    return
  }
  const demais = (perfilSel.value.overrides ?? []).filter(
    (override) => !(override.data === data && override.refeicao === celula.value?.refeicao),
  )
  const erro = await salvarOverrides(perfilSel.value.id, [...demais, { data, refeicao: celula.value.refeicao, itens }])
  if (erro) {
    erroOverride.value = erro
    return
  }
  celula.value = null
  await carregarConsolidado()
}

async function restaurarHerdado() {
  if (!celula.value || !perfilSel.value) return
  const data = celula.value.dia.data
  if (!data) return
  const erro = await removerOverride(perfilSel.value.id, data, celula.value.refeicao)
  if (erro) {
    erroOverride.value = erro
    return
  }
  celula.value = null
  await carregarConsolidado()
}
</script>

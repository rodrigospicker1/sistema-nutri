<template>
   <div class="space-y-5">
    <div class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-serif text-3xl text-forest">Refeições por etapa e turno</h1>
        <p class="mt-1 text-sm text-ink/65">
          Define quais refeições cada turno de cada etapa tem direito. A lista de compras só conta alunos nas refeições permitidas.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="unidadeSel" class="campo w-auto min-w-56">
          <option :value="null">Todas as unidades (regra geral)</option>
          <option v-for="unidade in unidadesAtivas" :key="unidade.erudioUnidadeEnsinoId" :value="unidade.erudioUnidadeEnsinoId">
            {{ unidade.nomeCompleto }}
          </option>
        </select>
        <button type="button" class="botao-primario" :disabled="salvando" @click="salvar">
          {{ salvando ? 'Salvando…' : 'Salvar matriz' }}
        </button>
      </div>
    </div>

    <p v-if="erro" class="rounded-xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">{{ erro }}</p>
    <p v-if="sucesso" class="rounded-xl border border-moss/40 bg-moss/20 px-4 py-3 text-sm text-leaf">{{ sucesso }}</p>

    <section class="rounded-2xl border border-line bg-white p-5">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="font-semibold text-forest">Tipos de refeição</h2>
          <p class="text-xs text-ink/60">Os tipos cadastrados aparecem como colunas na matriz abaixo.</p>
        </div>
        <form class="flex items-center gap-2" @submit.prevent="adicionarTipo">
          <input v-model="novoTipoNome" class="campo w-56" placeholder="Ex.: Lanche da tarde" />
          <button type="submit" class="botao-secundario">Adicionar</button>
        </form>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="tipo in tiposRefeicao"
          :key="tipo.id"
          class="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-sm"
        >
          {{ tipo.nome }}
          <button type="button" class="text-clay" :aria-label="`Remover ${tipo.nome}`" @click="removerTipo(tipo.id)">×</button>
        </span>
        <p v-if="!tiposRefeicao.length" class="text-sm text-ink/60">Nenhum tipo cadastrado.</p>
      </div>
    </section>

    <section class="overflow-x-auto rounded-2xl border border-line bg-white">
      <table class="w-full min-w-[60rem] border-collapse text-sm">
        <thead>
          <tr class="bg-cream">
            <th class="border-b border-line px-3 py-3 text-left">Etapa</th>
            <th class="border-b border-line px-3 py-3 text-left">Turno</th>
            <th class="border-b border-line px-3 py-3 text-left">Unidade</th>
            <th v-for="tipo in tiposRefeicao" :key="tipo.id" class="border-b border-l border-line px-3 py-3 text-center">
              {{ tipo.nome }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="combo in combos" :key="chaveCombo(combo)" class="border-t border-line">
            <td class="px-3 py-2 font-medium">{{ nomeEtapa(combo.erudioEtapaId) }}</td>
            <td class="px-3 py-2">{{ nomeTurno(combo.erudioTurnoId) }}</td>
            <td class="px-3 py-2 text-ink/60">{{ unidadeSel == null ? 'Regra geral' : nomeUnidade(unidadeSel) }}</td>
            <td v-for="tipo in tiposRefeicao" :key="tipo.id" class="border-l border-line px-3 py-2 text-center">
              <input
                type="checkbox"
                :checked="selecionadas(chaveCombo(combo)).has(tipo.id)"
                @change="alternar(chaveCombo(combo), tipo.id)"
              />
            </td>
          </tr>
          <tr v-if="!combos.length">
            <td :colspan="2 + tiposRefeicao.length" class="px-3 py-6 text-center text-ink/60">
              Nenhuma combinação etapa/turno com alunos ativos para este escopo.
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
const { tiposRefeicao, regrasRefeicao, salvarTipoRefeicao, removerTipoRefeicao, salvarMatrizRefeicao } = useNutricao()
const { unidades, turnos, contagem, nomeUnidade, nomeEtapa } = useErudioMock()

const unidadeSel = ref<number | null>(null)
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')
const novoTipoNome = ref('')

const selecionadasMap = ref(new Map<string, Set<string>>())

const unidadesAtivas = computed(() => unidades.value.filter((unidade) => unidade.ativo))

function nomeTurno(id: number): string {
  return turnos.value.find((turno) => turno.erudioTurnoId === id)?.nome ?? `Turno ${id}`
}

function chaveCombo(combo: { erudioEtapaId: number; erudioTurnoId: number; erudioUnidadeEnsinoId?: number | null }): string {
  return `${combo.erudioEtapaId}:${combo.erudioTurnoId}:${combo.erudioUnidadeEnsinoId ?? 'geral'}`
}

const combos = computed(() => {
  const vistos = new Map<string, { erudioEtapaId: number; erudioTurnoId: number; erudioUnidadeEnsinoId?: number | null }>()
  for (const linha of contagem.value) {
    if (linha.totalAlunosAtivos <= 0) continue
    if (unidadeSel.value != null && linha.erudioUnidadeEnsinoId !== unidadeSel.value) continue
    const chave = unidadeSel.value == null
      ? `${linha.erudioEtapaId}:${linha.erudioTurnoId}`
      : `${linha.erudioEtapaId}:${linha.erudioTurnoId}:${linha.erudioUnidadeEnsinoId}`
    if (!vistos.has(chave)) {
      vistos.set(chave, {
        erudioEtapaId: linha.erudioEtapaId,
        erudioTurnoId: linha.erudioTurnoId,
        erudioUnidadeEnsinoId: unidadeSel.value,
      })
    }
  }
  return [...vistos.values()].sort((a, b) => a.erudioEtapaId - b.erudioEtapaId || a.erudioTurnoId - b.erudioTurnoId)
})

function selecionadas(chave: string): Set<string> {
  return selecionadasMap.value.get(chave) ?? new Set()
}

function alternar(chave: string, refeicaoId: string) {
  const atual = new Set(selecionadasMap.value.get(chave) ?? [])
  if (atual.has(refeicaoId)) atual.delete(refeicaoId)
  else atual.add(refeicaoId)
  const novo = new Map(selecionadasMap.value)
  novo.set(chave, atual)
  selecionadasMap.value = novo
}

function carregarSelecao() {
  const mapa = new Map<string, Set<string>>()
  for (const regra of regrasRefeicao.value) {
    if (!regra.ativo) continue
    const unidade = regra.erudioUnidadeEnsinoId ?? null
    if (unidade !== unidadeSel.value) continue
    const chave = `${regra.erudioEtapaId}:${regra.erudioTurnoId}:${unidade ?? 'geral'}`
    const atual = mapa.get(chave) ?? new Set<string>()
    atual.add(regra.refeicaoId)
    mapa.set(chave, atual)
  }
  selecionadasMap.value = mapa
}

watch([unidadeSel, regrasRefeicao], carregarSelecao, { immediate: true })

async function adicionarTipo() {
  erro.value = ''
  const nome = novoTipoNome.value.trim()
  if (!nome) return
  const id = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `refeicao-${Date.now()}`
  const ordem = tiposRefeicao.value.length
  const falha = await salvarTipoRefeicao({ id, nome, ordem, ativo: true })
  if (falha) erro.value = falha
  else novoTipoNome.value = ''
}

async function removerTipo(id: string) {
  erro.value = ''
  const falha = await removerTipoRefeicao(id)
  if (falha) erro.value = falha
}

async function salvar() {
  erro.value = ''
  sucesso.value = ''
  salvando.value = true
  const regras = combos.value.map((combo) => ({
    erudioEtapaId: combo.erudioEtapaId,
    erudioTurnoId: combo.erudioTurnoId,
    erudioUnidadeEnsinoId: unidadeSel.value,
    refeicaoIds: [...selecionadas(chaveCombo(combo))],
  }))
  const falha = await salvarMatrizRefeicao(regras)
  salvando.value = false
  if (falha) erro.value = falha
  else sucesso.value = 'Matriz de refeições salva.'
}
</script>

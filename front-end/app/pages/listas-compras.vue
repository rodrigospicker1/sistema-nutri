<template>
  <div class="space-y-5">
    <div class="grid gap-4 rounded-2xl border border-line bg-white p-5 lg:grid-cols-[16rem_1fr]">
      <label class="block text-sm">
        Contrato de hortifruti
        <select v-model="contratoId" class="campo mt-1">
          <option v-for="contrato in contratos" :key="contrato.id" :value="contrato.id">
            {{ contrato.fornecedorNome }} · {{ contrato.numeroContrato }}
          </option>
        </select>
      </label>
      <div>
        <p class="text-sm">Datas de consumo</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="dia in datasDisponiveis"
            :key="dia.data"
            type="button"
            class="rounded-full border px-3 py-1.5 text-left text-xs"
            :class="selecionadas.includes(dia.data) ? 'border-leaf bg-moss' : 'border-line bg-white'"
            @click="alternar(dia.data)"
          >
            <span class="block font-semibold">{{ formatarData(dia.data) }}</span>
            <span class="text-ink/60">{{ dia.tipo }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button type="button" class="botao-primario" :disabled="processando" @click="executar(false, false)">
        Simular demanda
      </button>
      <button type="button" class="botao-secundario" :disabled="processando || !resultado" @click="executar(false, true)">
        Validar rateios
      </button>
      <button type="button" class="botao-secundario" :disabled="processando || !resultado" @click="executar(true, true)">
        Gerar pedido
      </button>
    </div>

    <p v-if="erro" class="rounded-xl bg-white px-4 py-3 text-sm text-clay">{{ erro }}</p>
    <p v-if="gravado" class="rounded-xl border border-moss/40 bg-moss/20 px-4 py-3 text-sm text-leaf">
      Lista de compras gerada e salva com os rateios informados.
    </p>

    <template v-if="resultado">
      <section v-if="resultado.itensPendentes.length" class="rounded-2xl border border-clay/40 bg-white p-5">
        <h2 class="font-serif text-2xl text-clay">Alertas de rateio</h2>
        <p class="mt-1 text-sm text-ink/70">Estes alertas não bloqueiam a geração da lista; revise os itens destacados abaixo.</p>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="(item, indice) in resultado.itensPendentes" :key="`${item.alimentoId}-${item.data}-${indice}`">
            <span class="font-medium">{{ item.nome }}</span>
            · {{ rotuloMotivo(item.motivo) }}
            <template v-if="item.quantidadeNecessaria != null"> · necessário {{ numero(item.quantidadeNecessaria, 2) }}{{ item.unidadeMedida ? ` ${rotuloUnidade(item.unidadeMedida)}` : '' }}</template>
            <template v-if="item.saldoDisponivel != null"> · saldo {{ numero(item.saldoDisponivel, 2) }}</template>
            <template v-if="item.quantidadeAlocada != null"> · alocado {{ numero(item.quantidadeAlocada, 2) }}</template>
          </li>
        </ul>
      </section>

      <p class="text-sm text-ink/65">
        Dias considerados: {{ resultado.datasConsideradas.map(formatarData).join(', ') || 'nenhum' }}.
        <span v-if="resultado.datasIgnoradas.length">Ignorados: {{ resultado.datasIgnoradas.map(formatarData).join(', ') }}.</span>
      </p>
      <div class="flex gap-2">
        <button type="button" class="rounded-full px-4 py-2 text-sm" :class="aba === 'alimentos' ? 'bg-forest text-white' : 'bg-white ring-1 ring-line'" @click="aba = 'alimentos'">
          Alocação de empenhos
        </button>
        <button type="button" class="rounded-full px-4 py-2 text-sm" :class="aba === 'escola' ? 'bg-forest text-white' : 'bg-white ring-1 ring-line'" @click="aba = 'escola'">
          Romaneio por escola (entrega)
        </button>
      </div>

      <div v-if="aba === 'alimentos'" class="space-y-3">
        <article v-for="item in resultado.consolidado" :key="item.alimentoId" class="rounded-2xl border border-line bg-white p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 class="font-semibold text-forest">{{ item.nome }}</h3>
              <p class="text-sm text-ink/65">
                Pedido: <strong>{{ numero(item.quantidadePedida, 2) }} {{ rotuloUnidade(item.unidadeMedida) }}</strong>
                <span class="text-ink/50">(calculado {{ numero(item.quantidadeCalculada, 2) }})</span>
              </p>
            </div>
            <p class="text-sm" :class="item.totalAlocado >= item.quantidadePedida ? 'text-leaf' : 'text-clay'">
              Alocado: {{ numero(item.totalAlocado, 2) }} · Valor: {{ moeda(item.valorTotal) }}
            </p>
          </div>

          <p v-if="!item.candidatos.length" class="mt-3 rounded-lg border border-clay/40 bg-clay/10 px-3 py-2 text-sm text-clay">
            SEM_EMPENHO: nenhum empenho ativo cobre este alimento no contrato.
          </p>

          <div v-else class="mt-3 space-y-2">
            <div
              v-for="candidato in item.candidatos"
              :key="candidato.empenhoId"
              class="flex flex-wrap items-center gap-3 rounded-xl bg-cream px-3 py-2 text-sm"
            >
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :checked="rateioDe(item.alimentoId, candidato.empenhoId) != null"
                  @change="alternarRateio(item, candidato.empenhoId, candidato.saldoDisponivel)"
                />
                <span class="font-medium">{{ candidato.numeroEmpenho }}</span>
              </label>
              <span class="text-ink/60">saldo {{ numero(candidato.saldoDisponivel, 2) }} {{ rotuloUnidade(item.unidadeMedida) }}</span>
              <span class="text-ink/60">{{ moeda(candidato.valorUnitario) }}/{{ rotuloUnidade(item.unidadeMedida).toLowerCase() }}</span>
              <template v-if="rateioDe(item.alimentoId, candidato.empenhoId) != null">
                <input
                  :value="rateioDe(item.alimentoId, candidato.empenhoId)"
                  type="number"
                  min="0"
                  step="0.01"
                  class="campo w-28"
                  @input="definirRateio(item.alimentoId, candidato.empenhoId, Number(($event.target as HTMLInputElement).value))"
                />
                <span class="text-ink/50">{{ rotuloUnidade(item.unidadeMedida) }}</span>
              </template>
            </div>
          </div>

          <ul v-if="alertasDoItem(item.alimentoId).length" class="mt-3 space-y-1 text-xs">
            <li v-for="alerta in alertasDoItem(item.alimentoId)" :key="`${alerta.motivo}-${alerta.empenhoId ?? ''}`" class="text-clay">
              {{ rotuloMotivo(alerta.motivo) }}<template v-if="alerta.empenhoId"> · empenho {{ nomeEmpenho(alerta.empenhoId) }}</template>
            </li>
          </ul>
        </article>
        <p v-if="resultado.consolidado.length === 0" class="rounded-2xl border border-line bg-white px-4 py-8 text-center text-ink/50">
          Nenhum hortifruti para essas datas.
        </p>
      </div>

      <div v-else class="space-y-3">
        <article v-for="escola in resultado.romaneio" :key="`${escola.erudioUnidadeEnsinoId}-${escola.erudioEtapaId}`" class="rounded-2xl border border-line bg-white p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="font-serif text-2xl text-forest">{{ escola.nomeEscola }}</h2>
              <p class="text-sm text-ink/65">{{ escola.alunosAtivos }} alunos ativos · etapa {{ escola.erudioEtapaId }}</p>
            </div>
            <span v-if="escola.substituicoesAplicadas.length" class="rounded-full bg-honey-soft px-3 py-1 text-xs font-semibold text-honey">
              {{ escola.substituicoesAplicadas.length }} troca(s) de alimentação especial
            </span>
          </div>
          <ul class="mt-3 space-y-1 text-sm">
            <li v-for="item in escola.itens" :key="item.alimentoId">
              {{ item.nome }} · {{ numero(item.quantidade, 2) }} {{ rotuloUnidade(item.unidadeMedida) }}
            </li>
          </ul>
          <ul class="mt-3 space-y-1 text-xs text-ink/70">
            <li v-for="troca in escola.substituicoesAplicadas" :key="`${troca.erudioMatriculaId}-${troca.alimentoOrigemId}`">
              Matrícula {{ troca.erudioMatriculaId }}: {{ nomeAlimento(troca.alimentoOrigemId) }} → {{ nomeAlimento(troca.alimentoDestinoId) }} ({{ numero(troca.quantidadeGramas, 0) }} g)
            </li>
          </ul>
        </article>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { moeda, numero, rotuloTipoDia, rotuloUnidade } from '../../src/mocks/nutricao.mock'
import type { AlocacaoAlimento, ItemConsolidado, ItemPendente, ResultadoRomaneio } from '../../src/mocks/calcular-romaneio'

const { alimentos, cardapios, contratos, empenhos, simularLista } = useNutricao()
const cardapiosCompra = cardapios.value

const contratoId = ref('ct-kmj')
const selecionadas = ref(['2026-11-02', '2026-11-03', '2026-11-05'])
const aba = ref<'alimentos' | 'escola'>('alimentos')
const resultado = ref<ResultadoRomaneio | null>(null)
const erro = ref('')
const gravado = ref(false)
const processando = ref(false)
const rateios = ref<Record<string, Record<string, number>>>({})

const datasDisponiveis = computed(() => {
  const mapa = new Map<string, string>()
  for (const cardapio of cardapiosCompra) {
    if (cardapio.tipo !== 'MENSAL' || cardapio.status !== 'PRONTO') continue
    for (const dia of cardapio.dias) {
      if (dia.data) mapa.set(dia.data, rotuloTipoDia(dia.tipoDia))
    }
  }
  return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([data, tipo]) => ({ data, tipo }))
})

function alternar(data: string) {
  if (selecionadas.value.includes(data)) selecionadas.value = selecionadas.value.filter((item) => item !== data)
  else selecionadas.value = [...selecionadas.value, data].sort()
}

function formatarData(valor: string) {
  const [ano, mes, dia] = valor.slice(0, 10).split('-')
  if (!ano || !mes || !dia) return valor
  return `${dia}/${mes}/${ano}`
}

function nomeAlimento(id: string) {
  return alimentos.value.find((alimento) => alimento.id === id)?.nome ?? id
}

function nomeEmpenho(id: string) {
  return empenhos.value.find((empenho) => empenho.id === id)?.numeroEmpenho ?? id
}

function rotuloMotivo(motivo: ItemPendente['motivo']) {
  if (motivo === 'SEM_EMPENHO') return 'sem empenho que cubra o alimento'
  if (motivo === 'SEM_SALDO') return 'saldo do empenho insuficiente'
  return 'rateio não cobre a demanda'
}

function rateioDe(alimentoId: string, empenhoId: string): number | null {
  const valor = rateios.value[alimentoId]?.[empenhoId]
  return valor != null && valor > 0 ? valor : null
}

function definirRateio(alimentoId: string, empenhoId: string, quantidade: number) {
  const porAlimento = { ...(rateios.value[alimentoId] ?? {}) }
  if (quantidade > 0) porAlimento[empenhoId] = quantidade
  else delete porAlimento[empenhoId]
  rateios.value = { ...rateios.value, [alimentoId]: porAlimento }
}

function alternarRateio(item: ItemConsolidado, empenhoId: string, saldoDisponivel: number) {
  if (rateioDe(item.alimentoId, empenhoId) != null) {
    definirRateio(item.alimentoId, empenhoId, 0)
    return
  }
  const falta = Math.max(0, item.quantidadePedida - totalAlocado(item.alimentoId))
  definirRateio(item.alimentoId, empenhoId, Math.min(saldoDisponivel, falta) || saldoDisponivel)
}

function totalAlocado(alimentoId: string): number {
  return Object.values(rateios.value[alimentoId] ?? {}).reduce((soma, valor) => soma + valor, 0)
}

function alertasDoItem(alimentoId: string) {
  return (resultado.value?.itensPendentes ?? []).filter((item) => item.alimentoId === alimentoId)
}

function alocacoesAtuais(): AlocacaoAlimento[] {
  return Object.entries(rateios.value)
    .map(([alimentoId, porEmpenho]) => ({
      alimentoId,
      rateios: Object.entries(porEmpenho)
        .filter(([, quantidade]) => quantidade > 0)
        .map(([empenhoId, quantidade]) => ({ empenhoId, quantidade })),
    }))
    .filter((alocacao) => alocacao.rateios.length > 0)
}

function sincronizarRateios(novo: ResultadoRomaneio) {
  const ids = new Set(novo.consolidado.map((item) => item.alimentoId))
  const filtrado: Record<string, Record<string, number>> = {}
  for (const [alimentoId, porEmpenho] of Object.entries(rateios.value)) {
    if (ids.has(alimentoId)) filtrado[alimentoId] = porEmpenho
  }
  rateios.value = filtrado
}

async function executar(gravar: boolean, validar: boolean) {
  erro.value = ''
  gravado.value = false
  processando.value = true
  const alocacoes = validar ? alocacoesAtuais() : undefined
  const resposta = await simularLista(contratoId.value, selecionadas.value, gravar, alocacoes)
  processando.value = false
  if (typeof resposta === 'string') {
    erro.value = resposta
    return
  }
  resultado.value = resposta
  sincronizarRateios(resposta)
  if (gravar) gravado.value = true
}
</script>

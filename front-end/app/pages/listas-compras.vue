<template>
  <div class="space-y-5">
    <div class="rounded-2xl border border-line bg-white p-5">
      <div>
        <p class="text-sm">Período de consumo</p>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <input v-model="periodoInicio" type="date" class="campo" aria-label="Data inicial" />
          <span class="text-ink/50">até</span>
          <input v-model="periodoFim" type="date" class="campo" aria-label="Data final" />
          <button type="button" class="botao-secundario !px-3 !py-1.5 text-xs" :disabled="!periodoValido" @click="aplicarPeriodo">
            Selecionar dias do período
          </button>
          <button type="button" class="text-xs text-leaf underline" @click="selecionadas = []">limpar</button>
        </div>
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
          <p v-if="datasDisponiveis.length === 0" class="text-sm text-ink/50">Nenhum dia de cardápio PRONTO cadastrado.</p>
        </div>
        <div class="mt-4 border-t border-line/60 pt-3">
          <p class="text-sm">Escopo <span class="text-ink/45">(vazio = todas as etapas e escolas)</span></p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="etapa in etapasErudio"
              :key="etapa.erudioEtapaId"
              type="button"
              class="rounded-full border px-2.5 py-1 text-xs"
              :class="etapasSel.includes(etapa.erudioEtapaId) ? 'border-leaf bg-moss' : 'border-line bg-white'"
              @click="alternarId(etapasSel, etapa.erudioEtapaId)"
            >
              {{ etapa.nome }}
            </button>
          </div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="unidade in unidadesErudio"
              :key="unidade.erudioUnidadeEnsinoId"
              type="button"
              class="rounded-full border px-2.5 py-1 text-xs"
              :class="unidadesSel.includes(unidade.erudioUnidadeEnsinoId) ? 'border-leaf bg-moss' : 'border-line bg-white'"
              @click="alternarId(unidadesSel, unidade.erudioUnidadeEnsinoId)"
            >
              {{ unidade.nome }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button type="button" class="botao-primario" :disabled="processando" @click="executar('simular')">
        Simular demanda
      </button>
      <button type="button" class="botao-secundario" :disabled="processando || !resultado" @click="executar('rascunho')">
        Salvar rascunho
      </button>
      <button type="button" class="botao-secundario" :disabled="processando || !resultado" @click="executar('confirmar')">
        Gerar lista confirmada
      </button>
    </div>

    <p v-if="erro" class="rounded-xl bg-white px-4 py-3 text-sm text-clay">{{ erro }}</p>
    <p v-if="gravado" class="rounded-xl border border-moss/40 bg-moss/20 px-4 py-3 text-sm text-leaf">
      {{ gravado === 'RASCUNHO' ? 'Rascunho salvo — não abate o saldo dos empenhos até ser confirmado.' : 'Lista confirmada e salva; o saldo dos empenhos já foi abatido.' }}
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
            <template v-if="item.quantidadeAlocada != null"> · alocado {{ numero(item.quantidadeAlocada, 2) }}</template>
            <template v-if="item.saldoTotalDisponivel != null"> · saldo total dos empenhos {{ numero(item.saldoTotalDisponivel, 2) }}</template>
            <template v-else-if="item.saldoDisponivel != null"> · saldo {{ numero(item.saldoDisponivel, 2) }}</template>
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
              <h3 class="font-semibold text-forest">
                {{ item.nome }}
                <span v-if="item.rateioSugerido" class="ml-1 rounded-full bg-honey-soft px-2 py-0.5 align-middle text-[11px] font-semibold text-honey">rateio sugerido</span>
              </h3>
              <p class="text-sm text-ink/65">
                Pedido: <strong>{{ numero(item.quantidadePedida, 2) }} {{ rotuloUnidade(item.unidadeMedida) }}</strong>
                <span class="text-ink/50">(calculado {{ numero(item.quantidadeCalculada, 2) }})</span>
              </p>
            </div>
            <p class="text-sm" :class="item.totalAlocado >= item.quantidadePedida ? 'text-leaf' : 'text-clay'">
              Alocado: {{ numero(totalAlocadoLocal(item.alimentoId), 2) }} · Valor: {{ moeda(item.valorTotal) }}
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
                <span v-if="candidato.dataFim" class="text-xs text-ink/50">até {{ formatarData(candidato.dataFim) }}</span>
              </label>
              <span class="text-ink/60">saldo {{ numero(candidato.saldoDisponivel, 2) }} {{ rotuloUnidade(item.unidadeMedida) }}</span>
              <span class="text-ink/60">{{ moeda(candidato.valorUnitario) }}/{{ rotuloUnidade(item.unidadeMedida).toLowerCase() }}</span>
              <span v-if="resumoEmpenho(item.alimentoId, candidato.empenhoId)" class="text-xs text-ink/50">
                {{ resumoEmpenho(item.alimentoId, candidato.empenhoId) }}
              </span>
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

    <section class="rounded-2xl border border-line bg-white p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-serif text-2xl text-forest">Listas geradas</h2>
          <p class="text-sm text-ink/65">Histórico das listas geradas. Só listas confirmadas abatem o saldo dos empenhos; o contrato de cada item é definido pelo empenho alocado.</p>
        </div>
        <button type="button" class="botao-secundario !px-3 !py-1.5 text-xs" :disabled="carregandoListas" @click="carregarListas">
          Atualizar
        </button>
      </div>
      <p v-if="erroListas" class="mt-3 text-sm text-clay">{{ erroListas }}</p>
      <div v-else class="mt-4 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
              <th class="pb-2 pr-4 font-medium">Criada em</th>
              <th class="pb-2 pr-4 font-medium">Período</th>
              <th class="pb-2 pr-4 font-medium">Status</th>
              <th class="pb-2 pr-4 font-medium">Itens</th>
              <th class="pb-2 pr-4 font-medium">Valor total</th>
              <th class="pb-2 pr-4 font-medium">Pendências</th>
              <th class="pb-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lista in listas" :key="lista.id" class="border-b border-line/60">
              <td class="py-2 pr-4 whitespace-nowrap">{{ formatarDataHora(lista.createdAt) }}</td>
              <td class="py-2 pr-4">{{ periodoLista(lista) }}</td>
              <td class="py-2 pr-4">
                <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="classeStatus(lista.status)">{{ rotuloStatus(lista.status) }}</span>
              </td>
              <td class="py-2 pr-4">{{ lista.consolidado.length }}</td>
              <td class="py-2 pr-4">{{ moeda(valorTotalLista(lista)) }}</td>
              <td class="py-2 pr-4">{{ lista.itensPendentes.length }}</td>
              <td class="py-2">
                <div class="flex gap-2">
                  <button
                    v-if="lista.status === 'RASCUNHO'"
                    type="button"
                    class="text-xs font-semibold text-leaf underline"
                    :disabled="processandoLista === lista.id"
                    @click="confirmar(lista.id)"
                  >
                    Confirmar
                  </button>
                  <button
                    v-if="lista.status !== 'CANCELADA'"
                    type="button"
                    class="text-xs font-semibold text-clay underline"
                    :disabled="processandoLista === lista.id"
                    @click="cancelar(lista.id)"
                  >
                    Cancelar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="listas.length === 0">
              <td colspan="7" class="py-6 text-center text-ink/50">Nenhuma lista de compras gerada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { moeda, numero, rotuloTipoDia, rotuloUnidade } from '../../src/mocks/nutricao.mock'
import type { AlocacaoAlimento, ItemConsolidado, ItemPendente, ListaCompras, ResultadoRomaneio } from '../../src/mocks/calcular-romaneio'
import type { SaldoConcorrenteAlimento, SaldoEmpenhoAlimento } from '../../src/types/nutricao'

const { alimentos, cardapios, empenhos, simularLista, gerarLista, listarListas, confirmarLista, cancelarLista, saldoConcorrente } = useNutricao()
const { unidades: unidadesErudio, etapas: etapasErudio } = useErudioMock()
const cardapiosCompra = cardapios.value

const periodoInicio = ref('')
const periodoFim = ref('')
const selecionadas = ref<string[]>([])
const etapasSel = ref<number[]>([])
const unidadesSel = ref<number[]>([])
const aba = ref<'alimentos' | 'escola'>('alimentos')
const resultado = ref<ResultadoRomaneio | null>(null)
const erro = ref('')
const gravado = ref<'' | 'RASCUNHO' | 'CONFIRMADA'>('')
const processando = ref(false)
const rateios = ref<Record<string, Record<string, number>>>({})

const listas = ref<ListaCompras[]>([])
const carregandoListas = ref(false)
const erroListas = ref('')
const processandoLista = ref('')
const saldosConcorrentes = ref<SaldoConcorrenteAlimento[]>([])

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

const periodoValido = computed(() => !periodoInicio.value || !periodoFim.value || periodoInicio.value <= periodoFim.value)

function aplicarPeriodo() {
  if (!periodoValido.value) return
  selecionadas.value = datasDisponiveis.value
    .map((dia) => dia.data)
    .filter((data) => (!periodoInicio.value || data >= periodoInicio.value) && (!periodoFim.value || data <= periodoFim.value))
    .sort()
}

function alternar(data: string) {
  if (selecionadas.value.includes(data)) selecionadas.value = selecionadas.value.filter((item) => item !== data)
  else selecionadas.value = [...selecionadas.value, data].sort()
}

function alternarId(lista: number[], id: number) {
  const indice = lista.indexOf(id)
  if (indice >= 0) lista.splice(indice, 1)
  else lista.push(id)
}

const escopo = computed(() => ({
  erudioEtapaIds: etapasSel.value,
  erudioUnidadeEnsinoIds: unidadesSel.value,
}))

function formatarData(valor: string | Date | undefined) {
  if (!valor) return '—'
  const texto = valor instanceof Date ? valor.toISOString() : String(valor)
  const [ano, mes, dia] = texto.slice(0, 10).split('-')
  if (!ano || !mes || !dia) return texto
  return `${dia}/${mes}/${ano}`
}

function formatarDataHora(valor: string | undefined) {
  if (!valor) return '—'
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return valor
  return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
  const falta = Math.max(0, item.quantidadePedida - totalAlocadoLocal(item.alimentoId))
  definirRateio(item.alimentoId, empenhoId, Math.min(saldoDisponivel, falta) || saldoDisponivel)
}

function totalAlocadoLocal(alimentoId: string): number {
  return Object.values(rateios.value[alimentoId] ?? {}).reduce((soma, valor) => soma + valor, 0)
}

function alertasDoItem(alimentoId: string) {
  return (resultado.value?.itensPendentes ?? []).filter((item) => item.alimentoId === alimentoId)
}

function saldoDoEmpenho(alimentoId: string, empenhoId: string): SaldoEmpenhoAlimento | undefined {
  return saldosConcorrentes.value
    .find((saldo) => saldo.alimentoId === alimentoId)
    ?.empenhos.find((empenho) => empenho.empenhoId === empenhoId)
}

function resumoEmpenho(alimentoId: string, empenhoId: string): string {
  const saldo = saldoDoEmpenho(alimentoId, empenhoId)
  if (!saldo) return ''
  return `empenhado ${numero(saldo.qtdEmpenhada, 2)} · já alocado ${numero(saldo.qtdAlocada, 2)}`
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
  // Rateio sugerido pelo motor entra como ponto de partida quando o usuário
  // ainda não mexeu naquele alimento — ele pode editar antes de gerar.
  for (const item of novo.consolidado) {
    const atual = filtrado[item.alimentoId]
    const temValor = atual && Object.values(atual).some((quantidade) => quantidade > 0)
    if (temValor || !item.rateioSugerido) continue
    const sugerido: Record<string, number> = {}
    for (const alocacao of item.alocacoes) {
      if (alocacao.quantidade > 0) sugerido[alocacao.empenhoId] = alocacao.quantidade
    }
    if (Object.keys(sugerido).length > 0) filtrado[item.alimentoId] = sugerido
  }
  rateios.value = filtrado
}

async function executar(modo: 'simular' | 'rascunho' | 'confirmar') {
  erro.value = ''
  gravado.value = ''
  processando.value = true
  if (modo === 'simular') {
    const resposta = await simularLista(undefined, selecionadas.value, alocacoesAtuais(), escopo.value)
    processando.value = false
    if (typeof resposta === 'string') {
      erro.value = resposta
      return
    }
    resultado.value = resposta
    sincronizarRateios(resposta)
    return
  }
  const resposta = await gerarLista(undefined, selecionadas.value, {
    alocacoes: alocacoesAtuais(),
    rascunho: modo === 'rascunho',
    escopo: escopo.value,
  })
  processando.value = false
  if (typeof resposta === 'string') {
    erro.value = resposta
    return
  }
  gravado.value = resposta.status === 'RASCUNHO' ? 'RASCUNHO' : 'CONFIRMADA'
  await Promise.all([carregarListas(), carregarSaldos()])
}

async function carregarListas() {
  carregandoListas.value = true
  erroListas.value = ''
  const resposta = await listarListas()
  carregandoListas.value = false
  if (typeof resposta === 'string') {
    erroListas.value = resposta
    listas.value = []
    return
  }
  listas.value = resposta
}

async function carregarSaldos() {
  const resposta = await saldoConcorrente()
  saldosConcorrentes.value = typeof resposta === 'string' ? [] : resposta
}

async function confirmar(id: string) {
  processandoLista.value = id
  erroListas.value = ''
  const resposta = await confirmarLista(id)
  processandoLista.value = ''
  if (typeof resposta === 'string') {
    erroListas.value = resposta
    return
  }
  listas.value = listas.value.map((lista) => (lista.id === id ? resposta : lista))
  await carregarSaldos()
}

async function cancelar(id: string) {
  processandoLista.value = id
  erroListas.value = ''
  const resposta = await cancelarLista(id)
  processandoLista.value = ''
  if (typeof resposta === 'string') {
    erroListas.value = resposta
    return
  }
  listas.value = listas.value.map((lista) => (lista.id === id ? resposta : lista))
  await carregarSaldos()
}

function periodoLista(lista: ListaCompras) {
  const datas = [...new Set((lista.datasConsideradas.length ? lista.datasConsideradas : lista.datasConsumo.map(formatarData)).map(formatarData))].sort()
  if (datas.length === 0) return '—'
  if (datas.length === 1) return datas[0]
  return `${datas[0]} → ${datas[datas.length - 1]} (${datas.length} dias)`
}

function valorTotalLista(lista: ListaCompras) {
  return lista.consolidado.reduce((soma, item) => soma + (item.valorTotal ?? 0), 0)
}

function classeStatus(status: ListaCompras['status']) {
  if (status === 'CONFIRMADA' || status === 'GERADA') return 'bg-moss/20 text-leaf'
  if (status === 'RASCUNHO') return 'bg-honey-soft text-honey'
  return 'bg-clay/10 text-clay'
}

function rotuloStatus(status: ListaCompras['status']) {
  if (status === 'GERADA') return 'CONFIRMADA'
  return status.charAt(0) + status.slice(1).toLowerCase()
}

onMounted(() => {
  void carregarListas()
  void carregarSaldos()
})
</script>

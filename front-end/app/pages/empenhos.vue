<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label class="block flex-1 text-sm">
        Contrato de hortifruti
        <select v-model="contratoId" class="campo mt-1">
          <option v-for="contrato in contratos" :key="contrato.id" :value="contrato.id">
            {{ contrato.fornecedorNome }} · {{ contrato.numeroContrato }}
          </option>
        </select>
      </label>
      <button type="button" class="botao-primario" @click="abrir">Novo empenho</button>
    </div>

    <p v-if="contrato" class="text-sm text-ink/65">
      Vigência {{ formatarData(contrato.vigenciaInicio) }} a {{ formatarData(contrato.vigenciaFim) }}.
      O consumo mostrado aqui é o das listas de compras do protótipo. Empenho inativo não reserva teto.
    </p>

    <article v-for="empenho in lista" :key="empenho.id" class="rounded-2xl border border-line bg-white p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-xs tracking-wide text-ink/50 uppercase">{{ empenho.fonteRecurso }}</p>
          <h2 class="font-serif text-2xl text-forest">{{ empenho.numeroEmpenho }}</h2>
          <p class="text-sm text-ink/70">{{ formatarData(empenho.dataInicio) }} a {{ formatarData(empenho.dataFim) }}</p>
        </div>
        <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="empenho.ativo ? 'bg-moss text-leaf' : 'bg-cream text-ink/50'">
          {{ empenho.ativo ? 'Ativo' : 'Inativo' }}
        </span>
      </div>

      <div class="mt-4 overflow-x-auto">
        <table class="w-full min-w-[40rem] text-left text-sm">
          <thead class="text-xs tracking-wide text-ink/55 uppercase">
            <tr>
              <th class="py-2 pr-3">Alimento</th>
              <th class="py-2 pr-3">Empenhado</th>
              <th class="py-2 pr-3">Consumido</th>
              <th class="py-2 pr-3">Disponível</th>
              <th class="py-2">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in empenho.itensEmpenhados" :key="item.alimentoId" class="border-t border-line">
              <td class="py-3 pr-3">
                <p class="font-medium">{{ nomeAlimento(item.alimentoId) }}</p>
                <p class="text-xs text-ink/55">{{ rotuloUnidade(item.unidadeMedida) }} · {{ moeda(item.valorUnitario) }}</p>
              </td>
              <td class="py-3 pr-3">
                {{ numero(item.qtdEmpenhada, 0) }}
                <span class="block text-xs text-ink/55">{{ moeda(item.qtdEmpenhada * item.valorUnitario) }}</span>
              </td>
              <td class="py-3 pr-3">
                {{ numero(item.qtdConsumida, 0) }}
                <span class="block text-xs text-ink/55">{{ moeda(item.qtdConsumida * item.valorUnitario) }}</span>
              </td>
              <td class="py-3 pr-3">
                {{ numero(item.qtdEmpenhada - item.qtdConsumida, 0) }}
                <span class="block text-xs text-ink/55">{{ moeda((item.qtdEmpenhada - item.qtdConsumida) * item.valorUnitario) }}</span>
              </td>
              <td class="py-3">
                <div class="flex h-2 w-36 overflow-hidden rounded-full bg-cream">
                  <div class="h-full bg-honey" :style="{ width: faixa(item.qtdConsumida, item.qtdEmpenhada) }" />
                  <div class="h-full bg-leaf" :style="{ width: faixa(item.qtdEmpenhada - item.qtdConsumida, item.qtdEmpenhada) }" />
                </div>
                <p class="mt-1 text-xs text-ink/50">Âmbar consumido · verde ainda no empenho</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-for="item in empenho.itensEmpenhados.filter((atual) => atual.previsaoMensal.length)" :key="`${empenho.id}-${item.alimentoId}`" class="mt-3">
        <p class="text-xs font-semibold tracking-wide text-ink/55 uppercase">Previsão mensal · {{ nomeAlimento(item.alimentoId) }}</p>
        <div class="mt-1 flex flex-wrap gap-2">
          <span v-for="previsao in item.previsaoMensal" :key="`${previsao.ano}-${previsao.mes}`" class="rounded-full bg-cream px-2 py-1 text-xs">
            {{ nomeMes(previsao.mes) }}/{{ previsao.ano }} · {{ numero(previsao.qtdPrevista, 0) }}
          </span>
        </div>
      </div>
    </article>

    <p v-if="lista.length === 0" class="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink/55">
      Nenhum empenho neste contrato.
    </p>

    <UiModal :aberto="aberto" painel titulo="Novo empenho" descricao="Os alimentos vêm do contrato escolhido. A quantidade não pode passar do saldo ainda não empenhado." @fechar="aberto = false">
      <form class="space-y-4" @submit.prevent="salvar">
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm">
            Número
            <input v-model="form.numeroEmpenho" required class="campo mt-1" placeholder="2026NE00510" />
          </label>
          <label class="text-sm">
            Fonte de recurso / dotação
            <input v-model="form.fonteRecurso" required class="campo mt-1" />
          </label>
          <label class="text-sm">
            Início
            <input v-model="form.dataInicio" required type="date" class="campo mt-1" />
          </label>
          <label class="text-sm">
            Fim
            <input v-model="form.dataFim" required type="date" class="campo mt-1" />
          </label>
        </div>

        <div v-for="(linha, indice) in form.linhas" :key="indice" class="space-y-3 rounded-xl border border-line p-3">
          <label class="block text-sm">
            Alimento do contrato
            <select v-model="linha.alimentoId" class="campo mt-1">
              <option v-for="item in itensAtivos" :key="item.alimentoId" :value="item.alimentoId">{{ nomeAlimento(item.alimentoId) }}</option>
            </select>
          </label>
          <p class="text-xs text-ink/65">
            Teto {{ numero(teto(linha.alimentoId), 0) }} {{ rotuloUnidade(unidadeDe(linha.alimentoId)) }}
            · já empenhado {{ numero(jaEmpenhado(contratoId, linha.alimentoId), 0) }}
            · disponível {{ numero(disponivel(linha.alimentoId), 0) }}
          </p>
          <label class="block text-sm">
            Quantidade a empenhar
            <input v-model.number="linha.qtdEmpenhada" type="number" min="0" step="1" class="campo mt-1" />
          </label>
          <div>
            <div class="mb-1 flex items-center justify-between">
              <p class="text-sm font-medium">Previsão mensal</p>
              <button type="button" class="text-xs text-leaf" @click="linha.previsaoMensal.push({ mes: 1, ano: 2026, qtdPrevista: 0 })">Adicionar mês</button>
            </div>
            <div v-for="(previsao, indiceMes) in linha.previsaoMensal" :key="indiceMes" class="mt-2 grid grid-cols-[1fr_6rem_6rem_auto] gap-2">
              <select v-model.number="previsao.mes" class="campo">
                <option v-for="mes in MESES" :key="mes.valor" :value="mes.valor">{{ mes.nome }}</option>
              </select>
              <input v-model.number="previsao.ano" type="number" class="campo" />
              <input v-model.number="previsao.qtdPrevista" type="number" min="0" class="campo" />
              <button type="button" class="text-xs text-clay" @click="linha.previsaoMensal.splice(indiceMes, 1)">Tirar</button>
            </div>
          </div>
          <button v-if="form.linhas.length > 1" type="button" class="text-xs text-clay" @click="form.linhas.splice(indice, 1)">Remover alimento</button>
        </div>

        <button type="button" class="botao-secundario" @click="adicionarLinha">Adicionar alimento</button>
        <p v-if="erro" class="text-sm text-clay">{{ erro }}</p>
        <button type="submit" class="botao-primario">Registrar empenho</button>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { moeda, numero, rotuloUnidade } from '../../src/mocks/nutricao.mock'
import { MESES, type UnidadeMedida } from '../../src/types/nutricao'

const route = useRoute()
const { alimentos, contratos, empenhos, criarEmpenho, jaEmpenhado } = useNutricao()

const contratoId = ref(typeof route.query.contrato === 'string' ? route.query.contrato : contratos.value[0]?.id ?? '')
const aberto = ref(false)
const erro = ref('')

const form = reactive({
  numeroEmpenho: '',
  fonteRecurso: 'PNAE — Agricultura familiar',
  dataInicio: '',
  dataFim: '',
  linhas: [] as Array<{ alimentoId: string; qtdEmpenhada: number; previsaoMensal: Array<{ mes: number; ano: number; qtdPrevista: number }> }>,
})

const contrato = computed(() => contratos.value.find((item) => item.id === contratoId.value))
const lista = computed(() => empenhos.value.filter((item) => item.contratoHortiId === contratoId.value))
const itensAtivos = computed(() => contrato.value?.itens.filter((item) => item.ativo) ?? [])

watch(
  () => route.query.contrato,
  (valor) => {
    if (typeof valor === 'string') contratoId.value = valor
  },
)

function nomeAlimento(id: string) {
  return alimentos.value.find((alimento) => alimento.id === id)?.nome ?? id
}

function nomeMes(mes: number) {
  return MESES.find((item) => item.valor === mes)?.curto ?? String(mes)
}

function itemContrato(alimentoId: string) {
  return contrato.value?.itens.find((item) => item.alimentoId === alimentoId && item.ativo)
}

function teto(alimentoId: string) {
  return itemContrato(alimentoId)?.qtdTotalLicitada ?? 0
}

function unidadeDe(alimentoId: string): UnidadeMedida {
  return itemContrato(alimentoId)?.unidadeMedida ?? 'KG'
}

function disponivel(alimentoId: string) {
  return teto(alimentoId) - jaEmpenhado(contratoId.value, alimentoId)
}

function faixa(parte: number, total: number) {
  if (total <= 0 || parte <= 0) return '0%'
  return `${Math.min(100, (parte / total) * 100)}%`
}

function formatarData(valor: string) {
  const [ano, mes, dia] = valor.slice(0, 10).split('-')
  if (!ano || !mes || !dia) return valor
  return `${dia}/${mes}/${ano}`
}

function adicionarLinha() {
  const alimentoId = itensAtivos.value[0]?.alimentoId
  if (!alimentoId) return
  form.linhas.push({ alimentoId, qtdEmpenhada: 0, previsaoMensal: [] })
}

function abrir() {
  erro.value = ''
  form.numeroEmpenho = ''
  form.fonteRecurso = 'PNAE — Agricultura familiar'
  form.dataInicio = contrato.value?.vigenciaInicio ?? ''
  form.dataFim = contrato.value?.vigenciaFim ?? ''
  form.linhas = []
  adicionarLinha()
  aberto.value = true
}

async function salvar() {
  if (!contrato.value) return
  const mensagem = await criarEmpenho({
    contratoHortiId: contrato.value.id,
    numeroEmpenho: form.numeroEmpenho,
    fonteRecurso: form.fonteRecurso,
    dataInicio: form.dataInicio,
    dataFim: form.dataFim,
    ativo: true,
    itensEmpenhados: form.linhas.map((linha) => ({
      alimentoId: linha.alimentoId,
      qtdEmpenhada: linha.qtdEmpenhada,
      qtdConsumida: 0,
      unidadeMedida: unidadeDe(linha.alimentoId),
      valorUnitario: itemContrato(linha.alimentoId)?.valorUnitario ?? 0,
      previsaoMensal: linha.previsaoMensal,
    })),
  })
  erro.value = mensagem ?? ''
  if (!mensagem) aberto.value = false
}
</script>

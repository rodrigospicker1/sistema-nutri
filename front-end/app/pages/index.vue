<template>
  <div class="space-y-8">
    <section>
      <div class="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 class="font-serif text-2xl text-forest">Cardápios de novembro/2026</h2>
          <p class="text-sm text-ink/65">Situação dos cardápios mensais em validação.</p>
        </div>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="cartao in statusMes" :key="cartao.status" class="rounded-2xl border border-line bg-white p-4">
          <p class="text-xs font-semibold tracking-wide text-ink/55 uppercase">{{ cartao.rotulo }}</p>
          <p class="mt-2 font-serif text-4xl text-forest">{{ cartao.quantidade }}</p>
          <ul class="mt-3 space-y-1 text-sm text-ink/75">
            <li v-for="nome in cartao.nomes" :key="nome">{{ nome }}</li>
            <li v-if="cartao.nomes.length === 0" class="text-ink/40">Nenhum cardápio</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <article class="rounded-2xl border border-line bg-white p-5">
        <h2 class="font-serif text-2xl text-forest">Empenhos de hortifruti</h2>
        <p class="mt-1 text-sm text-ink/65">Soma dos empenhos ativos sobre o valor contratado de KMJ e CoopaFren.</p>
        <dl class="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt class="text-xs text-ink/55 uppercase">Valor empenhado</dt>
            <dd class="mt-1 text-xl font-semibold">{{ moeda(resumoFinanceiro.valorEmpenhado) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-ink/55 uppercase">Valor licitado</dt>
            <dd class="mt-1 text-xl font-semibold">{{ moeda(resumoFinanceiro.valorLicitado) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-ink/55 uppercase">Saldo a empenhar</dt>
            <dd class="mt-1 text-xl font-semibold text-leaf">{{ moeda(resumoFinanceiro.saldo) }}</dd>
          </div>
        </dl>
        <div class="mt-5">
          <div class="mb-1 flex justify-between text-xs text-ink/60">
            <span>{{ resumoFinanceiro.empenhosAtivos }} empenhos ativos</span>
            <span>{{ percentualEmpenhado }}% do licitado</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-cream">
            <div class="h-full rounded-full bg-leaf" :style="{ width: `${percentualEmpenhado}%` }" />
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-line bg-white p-5">
        <h2 class="font-serif text-2xl text-forest">Agricultura familiar</h2>
        <p class="mt-1 text-sm text-ink/65">Meta legal de 45%. O total inclui a prestação de serviço registrada em outro sistema.</p>
        <p class="mt-4 font-serif text-5xl" :class="agriculturaFamiliar.atingiu ? 'text-leaf' : 'text-clay'">
          {{ numero(agriculturaFamiliar.percentual * 100, 1) }}%
        </p>
        <p class="mt-2 text-sm">
          {{ agriculturaFamiliar.atingiu ? 'Acima da meta' : 'Abaixo da meta' }}
          · {{ moeda(agriculturaFamiliar.familiar) }} de {{ moeda(agriculturaFamiliar.total) }}
        </p>
        <div class="relative mt-4 h-2 rounded-full bg-cream">
          <div class="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-honey" style="left: 45%" />
          <div class="h-full rounded-full bg-leaf" :style="{ width: `${Math.min(agriculturaFamiliar.percentual * 100, 100)}%` }" />
        </div>
        <p class="mt-2 text-xs text-ink/55">A marca âmbar indica os 45%.</p>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { moeda, numero, rotuloStatusCardapio } from '../../src/mocks/nutricao.mock'
import type { StatusCardapio } from '../../src/types/nutricao'

const { cardapios, resumoFinanceiro, agriculturaFamiliar } = useNutricao()

const ordem: StatusCardapio[] = ['NOVO', 'EM_ALTERACAO', 'EM_ANALISE_EMPRESA', 'PRONTO']

const statusMes = computed(() =>
  ordem.map((status) => {
    const lista = cardapios.value.filter((cardapio) => cardapio.tipo === 'MENSAL' && cardapio.mes === 11 && cardapio.ano === 2026 && cardapio.status === status)
    return { status, rotulo: rotuloStatusCardapio(status), quantidade: lista.length, nomes: lista.map((item) => item.nome) }
  }),
)

const percentualEmpenhado = computed(() => {
  if (resumoFinanceiro.value.valorLicitado <= 0) return 0
  return Math.min(100, Math.round((resumoFinanceiro.value.valorEmpenhado / resumoFinanceiro.value.valorLicitado) * 100))
})
</script>

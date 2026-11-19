<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <p class="max-w-2xl text-sm text-ink/70">
        Cada faixa vale para um agrupamento de cardápio. A média semanal em Cardápios usa a meta ativa deste agrupamento.
      </p>
      <button type="button" class="botao-primario" @click="abrirNova">Nova meta</button>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-line bg-white">
      <table class="w-full min-w-[40rem] text-left text-sm">
        <thead class="bg-cream text-xs tracking-wide text-ink/60 uppercase">
          <tr>
            <th class="px-4 py-3 font-semibold">Agrupamento</th>
            <th class="px-4 py-3 font-semibold">Faixa</th>
            <th class="px-4 py-3 font-semibold">Energia</th>
            <th class="px-4 py-3 font-semibold">Situação</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="faixa in referencias"
            :key="faixa.id"
            class="cursor-pointer border-t border-line hover:bg-moss/50"
            @click="editar(faixa.id)"
          >
            <td class="px-4 py-3">{{ nomeAgrupamento(faixa.agrupamentoCardapioId) }}</td>
            <td class="px-4 py-3 font-medium">{{ faixa.descricaoFaixa }}</td>
            <td class="px-4 py-3">{{ numero(faixa.kcalMin, 0) }}–{{ numero(faixa.kcalMax, 0) }} kcal</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="faixa.ativo ? 'bg-moss text-leaf' : 'bg-cream text-ink/60'">
                {{ faixa.ativo ? 'Ativa' : 'Inativa' }}
              </span>
            </td>
          </tr>
          <tr v-if="referencias.length === 0">
            <td colspan="4" class="px-4 py-10 text-center text-ink/50">Nenhuma meta cadastrada.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ReferenciaPnaeModal :aberto="aberta" :referencia-id="referenciaId" @fechar="aberta = false" />
  </div>
</template>

<script setup lang="ts">
import { numero } from '../../src/mocks/nutricao.mock'

const { agrupamentos, referencias } = useNutricao()
const aberta = ref(false)
const referenciaId = ref<string | null>(null)

function nomeAgrupamento(id: string) {
  return agrupamentos.value.find((item) => item.id === id)?.nome ?? 'Agrupamento'
}

function abrirNova() {
  referenciaId.value = null
  aberta.value = true
}

function editar(id: string) {
  referenciaId.value = id
  aberta.value = true
}
</script>

<template>
  <div>
    <button
      v-if="aberto"
      type="button"
      class="fixed inset-0 z-30 bg-ink/40 lg:hidden"
      aria-label="Fechar menu"
      @click="$emit('fechar')"
    />
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-forest text-cream transition-transform lg:static lg:translate-x-0"
      :class="aberto ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="border-b border-white/10 px-5 py-6">
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-leaf">
            <svg viewBox="0 0 24 24" class="size-6 text-white" aria-hidden="true">
              <path fill="currentColor" d="M12 3c2 4 2 7 0 10 3-1 6-1 9 1-1 5-5 8-9 8s-8-3-9-8c3-2 6-2 9-1-2-3-2-6 0-10Z" />
            </svg>
          </span>
          <div>
            <p class="font-serif text-lg leading-none">Merenda</p>
            <p class="mt-1 text-xs text-cream/70">Alimentação escolar</p>
          </div>
        </div>
      </div>
      <nav class="flex flex-1 flex-col gap-1 p-3">
        <NuxtLink
          v-for="item in itens"
          :key="item.to"
          :to="item.to"
          class="rounded-lg px-3 py-2.5 text-sm text-cream/80 transition hover:bg-white/10 hover:text-white"
          active-class="bg-white/15 font-semibold text-white"
        >
          {{ item.nome }}
        </NuxtLink>
      </nav>
      <div class="border-t border-white/10 px-5 py-4 text-xs leading-relaxed text-cream/60">
        Protótipo para conferência de campos. Contratos de compra: KMJ e CoopaFren. A terceirizada fica em outro sistema.
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
defineProps<{ aberto: boolean }>()
defineEmits<{ fechar: [] }>()

const itens = [
  { to: '/', nome: 'Visão geral' },
  { to: '/alimentos', nome: 'Alimentos' },
  { to: '/contratos', nome: 'Contratos hortifruti' },
  { to: '/empenhos', nome: 'Empenhos' },
  { to: '/fichas-tecnicas', nome: 'Fichas técnicas' },
  { to: '/cardapios', nome: 'Cardápios' },
  { to: '/alimentacao-especial', nome: 'Alimentação especial' },
  { to: '/regras-refeicao', nome: 'Refeições por turno' },
  { to: '/referencias-pnae', nome: 'Metas PNAE' },
  { to: '/regras-incidencia', nome: 'Regras de incidência' },
  { to: '/listas-compras', nome: 'Lista de compras' },
]
</script>

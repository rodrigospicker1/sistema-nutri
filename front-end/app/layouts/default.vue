<template>
  <div class="min-h-screen bg-cream lg:grid lg:grid-cols-[16.5rem_1fr]">
    <AppSidebar :aberto="menuAberto" @fechar="menuAberto = false" />
    <div class="min-w-0">
      <header class="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:px-8">
        <button
          type="button"
          class="grid size-10 place-items-center rounded-lg border border-line bg-white lg:hidden"
          aria-label="Abrir menu"
          @click="menuAberto = true"
        >
          <span class="block h-0.5 w-4 bg-ink shadow-[0_5px_0_#1b2a22,0_-5px_0_#1b2a22]" />
        </button>
        <div class="min-w-0">
          <p class="text-xs font-semibold tracking-[0.14em] text-leaf uppercase">SME · PNAE</p>
          <h1 class="truncate font-serif text-xl text-forest">{{ titulo }}</h1>
        </div>
        <p class="ml-auto hidden text-sm text-ink/60 sm:block">Validação com a equipe de nutrição</p>
      </header>
      <main class="px-4 py-6 lg:px-8 lg:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const menuAberto = ref(false)

const titulos: Record<string, string> = {
  '/': 'Visão geral',
  '/alimentos': 'Catálogo de alimentos',
  '/contratos': 'Contratos hortifruti',
  '/empenhos': 'Empenhos',
  '/fichas-tecnicas': 'Fichas técnicas',
  '/cardapios': 'Grade de cardápios',
  '/referencias-pnae': 'Metas nutricionais PNAE',
  '/regras-incidencia': 'Regras de incidência',
  '/listas-compras': 'Lista de compras',
}

const titulo = computed(() => titulos[route.path] ?? 'Alimentação escolar')

watch(() => route.path, () => {
  menuAberto.value = false
})
</script>

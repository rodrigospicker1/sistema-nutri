<template>
  <Teleport to="body">
    <div v-if="aberto" class="fixed inset-0 z-50">
      <button type="button" class="absolute inset-0 bg-ink/45" aria-label="Fechar" @click="$emit('fechar')" />
      <section
        role="dialog"
        aria-modal="true"
        class="absolute flex flex-col bg-paper shadow-2xl"
        :class="painel ? 'inset-y-0 right-0 w-full max-w-2xl' : 'inset-x-4 top-[6vh] mx-auto max-h-[88vh] max-w-xl rounded-2xl sm:inset-x-auto'"
      >
        <header class="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 class="font-serif text-2xl text-forest">{{ titulo }}</h2>
            <p v-if="descricao" class="mt-1 text-sm text-ink/70">{{ descricao }}</p>
          </div>
          <button type="button" class="rounded-lg px-2 py-1 text-sm text-ink/60 hover:bg-cream" @click="$emit('fechar')">
            Fechar
          </button>
        </header>
        <div class="overflow-y-auto px-5 py-5">
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ aberto: boolean; titulo: string; descricao?: string; painel?: boolean }>()
const emit = defineEmits<{ fechar: [] }>()

function aoTeclar(evento: KeyboardEvent) {
  if (evento.key === 'Escape' && props.aberto) emit('fechar')
}

onMounted(() => window.addEventListener('keydown', aoTeclar))
onBeforeUnmount(() => window.removeEventListener('keydown', aoTeclar))
</script>

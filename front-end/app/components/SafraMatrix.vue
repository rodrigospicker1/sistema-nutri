<template>
  <div>
    <div class="mb-3 flex flex-wrap gap-2 text-xs">
      <span v-for="status in STATUS_SAFRA" :key="status" class="inline-flex items-center gap-1.5">
        <i class="size-2.5 rounded-full" :class="corPonto[status]" />
        {{ rotuloSafra(status) }}
      </span>
    </div>
    <div class="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
      <button
        v-for="item in modelValue"
        :key="item.mes"
        type="button"
        class="rounded-lg border px-1 py-2 text-center text-xs font-semibold"
        :class="corBotao[item.status]"
        :aria-label="`${nomeMes(item.mes)}: ${rotuloSafra(item.status)}. Clique para alternar.`"
        @click="alternar(item.mes)"
      >
        <span class="block text-[10px] font-medium uppercase opacity-80">{{ mesCurto(item.mes) }}</span>
        {{ curto[item.status] }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nomeMes, rotuloSafra } from '../../src/mocks/nutricao.mock'
import { MESES, STATUS_SAFRA, type SafraMes, type StatusSafra } from '../../src/types/nutricao'

const props = defineProps<{ modelValue: SafraMes[] }>()
const emit = defineEmits<{ 'update:modelValue': [SafraMes[]] }>()

const proximo: Record<StatusSafra, StatusSafra> = {
  SAFRA_PLENA: 'MEDIA_PRODUCAO',
  MEDIA_PRODUCAO: 'FORA_SAFRA',
  FORA_SAFRA: 'SAFRA_PLENA',
}

const curto: Record<StatusSafra, string> = {
  SAFRA_PLENA: 'Plena',
  MEDIA_PRODUCAO: 'Média',
  FORA_SAFRA: 'Fora',
}

const corBotao: Record<StatusSafra, string> = {
  SAFRA_PLENA: 'border-leaf bg-leaf text-white',
  MEDIA_PRODUCAO: 'border-honey bg-honey text-white',
  FORA_SAFRA: 'border-line bg-white text-ink/70',
}

const corPonto: Record<StatusSafra, string> = {
  SAFRA_PLENA: 'bg-leaf',
  MEDIA_PRODUCAO: 'bg-honey',
  FORA_SAFRA: 'bg-ink/25',
}

function mesCurto(mes: number) {
  return MESES.find((item) => item.valor === mes)?.curto ?? mes
}

function alternar(mes: number) {
  emit(
    'update:modelValue',
    props.modelValue.map((item) => (item.mes === mes ? { ...item, status: proximo[item.status] } : item)),
  )
}
</script>

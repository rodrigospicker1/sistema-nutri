<template>
  <UiModal
    :aberto="aberto"
    painel
    :titulo="referenciaId ? 'Editar meta PNAE' : 'Nova meta PNAE'"
    descricao="Os mínimos e máximos entram na hora na média semanal do cardápio deste agrupamento."
    @fechar="cancelar"
  >
    <form class="space-y-6" @submit.prevent="concluir">
      <fieldset class="space-y-3">
        <legend class="font-semibold text-forest">Identificação</legend>
        <label class="block text-sm">
          Agrupamento
          <select v-model="rascunho.agrupamentoCardapioId" class="campo mt-1">
            <option v-for="agrupamento in agrupamentos" :key="agrupamento.id" :value="agrupamento.id">{{ agrupamento.nome }}</option>
          </select>
        </label>
        <label class="block text-sm">
          Descrição da faixa
          <input v-model="rascunho.descricaoFaixa" required class="campo mt-1" placeholder="Berçário 1 (6 a 11 meses) - 70% VET" />
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="rascunho.ativo" type="checkbox" />
          Meta ativa
        </label>
      </fieldset>

      <fieldset v-for="grupo in grupos" :key="grupo.titulo" class="space-y-3">
        <legend class="font-semibold text-forest">{{ grupo.titulo }}</legend>
        <div v-for="campo in grupo.campos" :key="campo.chave" class="grid grid-cols-[1fr_7rem_7rem] items-end gap-2">
          <p class="pb-2 text-sm">{{ campo.rotulo }} <span class="text-ink/50">({{ campo.unidade }})</span></p>
          <label class="text-xs text-ink/60">
            Mínimo
            <input
              type="number"
              min="0"
              step="0.1"
              class="campo mt-1"
              :value="rascunho[`${campo.chave}Min`]"
              @input="definir(campo.chave, 'Min', $event)"
              @change="definir(campo.chave, 'Min', $event)"
            />
          </label>
          <label class="text-xs text-ink/60">
            Máximo
            <input
              type="number"
              min="0"
              step="0.1"
              class="campo mt-1"
              :value="rascunho[`${campo.chave}Max`]"
              @input="definir(campo.chave, 'Max', $event)"
              @change="definir(campo.chave, 'Max', $event)"
            />
          </label>
        </div>
      </fieldset>

      <p v-if="erro" class="text-sm text-clay">{{ erro }}</p>
      <div class="flex gap-2">
        <button type="submit" class="botao-primario">Concluir</button>
        <button type="button" class="botao-secundario" @click="cancelar">Cancelar</button>
      </div>
    </form>
  </UiModal>
</template>

<script setup lang="ts">
import { FAIXAS_COMPARACAO, copiar } from '../../src/mocks/nutricao.mock'
import type { FaixaChave, FaixaPnae } from '../../src/types/nutricao'

const props = defineProps<{ aberto: boolean; referenciaId: string | null; agrupamentoInicialId?: string }>()
const emit = defineEmits<{ fechar: [] }>()

const { agrupamentos, referencias, salvarReferencia, novoId } = useNutricao()

const grupos = [
  {
    titulo: 'Energia e macronutrientes',
    campos: FAIXAS_COMPARACAO.filter((faixa) => ['kcal', 'carboidratos', 'proteina', 'lipidios'].includes(faixa.chave)),
  },
  {
    titulo: 'Micronutrientes e sódio',
    campos: FAIXAS_COMPARACAO.filter((faixa) => ['calcio', 'ferro', 'vitaminaA', 'vitaminaC', 'sodio'].includes(faixa.chave)),
  },
]

const rascunho = reactive<FaixaPnae>(faixaVazia(''))
let snapshot: FaixaPnae | null = null
let criadaAgora = false
let concluirPedido = false

const erro = computed(() => validar(rascunho))

watch(
  () => props.aberto,
  (aberto) => {
    if (!aberto) return
    concluirPedido = false
    criadaAgora = false
    if (props.referenciaId) {
      const atual = referencias.value.find((item) => item.id === props.referenciaId)
      if (!atual) return
      Object.assign(rascunho, copiar(atual))
      snapshot = copiar(atual)
      return
    }
    const nova = faixaVazia(props.agrupamentoInicialId || agrupamentos.value[0]?.id || '')
    nova.id = novoId('pnae')
    Object.assign(rascunho, nova)
    snapshot = null
    criadaAgora = true
  },
)

watch(
  rascunho,
  async () => {
    if (!props.aberto || !rascunho.id || criadaAgora) return
    await salvarReferencia(copiar(rascunho))
  },
  { deep: true },
)

function definir(chave: FaixaChave, lado: 'Min' | 'Max', evento: Event) {
  const bruto = Number((evento.target as HTMLInputElement).value)
  rascunho[`${chave}${lado}`] = Number.isFinite(bruto) ? bruto : 0
}

async function concluir() {
  if (erro.value) return
  await salvarReferencia(copiar(rascunho))
  criadaAgora = false
  concluirPedido = true
  emit('fechar')
}

async function cancelar() {
  if (!concluirPedido && snapshot) await salvarReferencia(snapshot)
  concluirPedido = false
  emit('fechar')
}

function faixaVazia(agrupamentoCardapioId: string): FaixaPnae {
  return {
    id: '',
    agrupamentoCardapioId,
    descricaoFaixa: '',
    ativo: true,
    kcalMin: 0,
    kcalMax: 0,
    carboidratosMin: 0,
    carboidratosMax: 0,
    proteinaMin: 0,
    proteinaMax: 0,
    lipidiosMin: 0,
    lipidiosMax: 0,
    calcioMin: 0,
    calcioMax: 0,
    ferroMin: 0,
    ferroMax: 0,
    vitaminaAMin: 0,
    vitaminaAMax: 0,
    vitaminaCMin: 0,
    vitaminaCMax: 0,
    sodioMin: 0,
    sodioMax: 0,
  }
}

function validar(faixa: FaixaPnae): string {
  if (!faixa.agrupamentoCardapioId) return 'Escolha o agrupamento.'
  if (!faixa.descricaoFaixa.trim()) return 'Informe a descrição da faixa.'
  for (const campo of FAIXAS_COMPARACAO) {
    const min = faixa[`${campo.chave}Min`]
    const max = faixa[`${campo.chave}Max`]
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0) {
      return `${campo.rotulo} precisa de mínimo e máximo a partir de zero.`
    }
    if (min > max) return `${campo.rotulo}: o mínimo não pode passar do máximo.`
  }
  return ''
}
</script>

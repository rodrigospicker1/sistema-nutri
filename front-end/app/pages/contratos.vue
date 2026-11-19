<template>
  <div class="space-y-5">
    <div class="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <div class="space-y-2">
        <button
          v-for="contrato in contratos"
          :key="contrato.id"
          type="button"
          class="block w-full rounded-2xl border px-4 py-3 text-left"
          :class="selecionado?.id === contrato.id ? 'border-leaf bg-moss' : 'border-line bg-white'"
          @click="contratoHortiId = contrato.id"
        >
          <p class="font-semibold">{{ contrato.fornecedorNome }}</p>
          <p class="text-sm text-ink/65">{{ contrato.numeroContrato }}</p>
          <p class="mt-2 text-xs" :class="contrato.agriculturaFamiliar ? 'text-leaf' : 'text-ink/50'">
            {{ contrato.agriculturaFamiliar ? 'Agricultura familiar' : 'Sem agricultura familiar' }}
          </p>
        </button>
      </div>

      <section v-if="selecionado" class="space-y-4">
        <div class="rounded-2xl border border-line bg-white p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs tracking-wide text-ink/50 uppercase">{{ selecionado.numeroContrato }} · {{ selecionado.fornecedorCnpj }}</p>
              <h2 class="font-serif text-3xl text-forest">{{ selecionado.fornecedorNome }}</h2>
              <p class="mt-1 text-sm text-ink/70">
                Vigência {{ formatarData(selecionado.vigenciaInicio) }} a {{ formatarData(selecionado.vigenciaFim) }}
                · {{ moeda(valorContratado(selecionado)) }}
              </p>
            </div>
            <button type="button" class="botao-primario" @click="historicoAberto = true">Registrar reajuste / aditivo</button>
          </div>
          <p class="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold" :class="selecionado.agriculturaFamiliar ? 'bg-moss text-leaf' : 'bg-cream text-ink/70'">
            Agricultura familiar: {{ selecionado.agriculturaFamiliar ? 'sim' : 'não' }}
          </p>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-line bg-white">
          <table class="w-full min-w-[64rem] text-left text-sm">
            <thead class="bg-cream text-xs tracking-wide text-ink/55 uppercase">
              <tr>
                <th class="px-4 py-3">Alimento</th>
                <th class="px-4 py-3">Unidade</th>
                <th class="px-4 py-3">Valor unitário</th>
                <th class="px-4 py-3">Qtd. licitada</th>
                <th class="px-4 py-3">Entrega</th>
                <th class="px-4 py-3">Ativo</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, indice) in itensEdicao" :key="item.alimentoId" class="border-t border-line align-top">
                <td class="px-4 py-3 font-medium">{{ nomeAlimento(item.alimentoId) }}</td>
                <td class="px-4 py-3">
                  <select v-model="item.unidadeMedida" class="campo w-28! py-1.5! text-sm" @change="marcarSujo">
                    <option v-for="unidade in UNIDADES_MEDIDA" :key="unidade" :value="unidade">{{ rotuloUnidade(unidade) }}</option>
                  </select>
                </td>
                <td class="px-4 py-3">
                  <input v-model.number="item.valorUnitario" type="number" min="0" step="0.01" class="campo w-28! py-1.5! text-sm" @input="marcarSujo" />
                </td>
                <td class="px-4 py-3">
                  <input v-model.number="item.qtdTotalLicitada" type="number" min="0" step="1" class="campo w-28! py-1.5! text-sm" @input="marcarSujo" />
                </td>
                <td class="px-4 py-3">
                  <span class="flex flex-wrap gap-1">
                    <button
                      v-for="dia in [1, 2, 3, 4, 5]"
                      :key="dia"
                      type="button"
                      class="rounded-full border px-2 py-0.5 text-xs"
                      :class="item.diasSemanaEntrega.includes(dia) ? 'border-leaf bg-moss' : 'border-line text-ink/50'"
                      @click="alternarDiaItem(item, dia)"
                    >
                      {{ ['', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex'][dia] }}
                    </button>
                  </span>
                </td>
                <td class="px-4 py-3">
                  <input v-model="item.ativo" type="checkbox" class="h-4 w-4 accent-leaf" @change="marcarSujo" />
                </td>
                <td class="px-4 py-3">
                  <button type="button" class="text-sm text-clay hover:underline" @click="removerItem(indice)">Remover</button>
                </td>
              </tr>
              <tr v-if="itensEdicao.length === 0">
                <td colspan="7" class="px-4 py-6 text-center text-sm text-ink/50">Nenhum item no contrato.</td>
              </tr>
            </tbody>
          </table>
          <div class="flex flex-wrap items-end gap-3 border-t border-line px-4 py-3">
            <label class="text-sm">
              Adicionar alimento
              <select v-model="novoAlimentoId" class="campo mt-1 w-64!">
                <option value="">Selecione…</option>
                <option v-for="alimento in alimentosDisponiveis" :key="alimento.id" :value="alimento.id">{{ alimento.nome }}</option>
              </select>
            </label>
            <button type="button" class="botao-secundario" :disabled="!novoAlimentoId" @click="adicionarItem">Adicionar</button>
            <div class="ml-auto flex items-center gap-3">
              <p v-if="erroItens" class="text-sm text-clay">{{ erroItens }}</p>
              <p v-else-if="itensSujos" class="text-sm text-ink/60">Há alterações não salvas.</p>
              <button type="button" class="botao-primario" :disabled="!itensSujos || salvandoItens" @click="salvarItens">
                {{ salvandoItens ? 'Salvando…' : 'Salvar itens' }}
              </button>
            </div>
          </div>
        </div>

        <section class="rounded-2xl border border-line bg-white p-5">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 class="font-serif text-2xl text-forest">Empenhos ativos</h3>
              <p class="text-sm text-ink/65">A barra mostra o que já foi reservado em empenho. O disponível ainda cabe na quantidade licitada.</p>
            </div>
            <NuxtLink :to="`/empenhos?contrato=${selecionado.id}`" class="botao-secundario">Abrir empenhos</NuxtLink>
          </div>
          <div class="mt-4 space-y-4">
            <div v-for="item in selecionado.itens.filter((atual) => atual.ativo)" :key="item.alimentoId">
              <div class="mb-1 flex justify-between gap-3 text-sm">
                <span class="font-medium">{{ nomeAlimento(item.alimentoId) }}</span>
                <span>{{ numero(saldoItem(selecionado.id, item.alimentoId).empenhada, 0) }} empenhados · {{ numero(saldoItem(selecionado.id, item.alimentoId).disponivel, 0) }} disponíveis</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-cream">
                <div class="h-full bg-leaf" :style="{ width: largura(item.alimentoId) }" />
              </div>
            </div>
          </div>
          <ul class="mt-4 space-y-1 text-sm text-ink/70">
            <li v-for="empenho in empenhosDoContrato" :key="empenho.id">
              {{ empenho.numeroEmpenho }} · {{ formatarData(empenho.dataInicio) }} a {{ formatarData(empenho.dataFim) }}
            </li>
            <li v-if="empenhosDoContrato.length === 0">Nenhum empenho ativo neste contrato.</li>
          </ul>
        </section>
      </section>
    </div>

    <UiModal :aberto="historicoAberto" painel titulo="Histórico e alterações" descricao="O registro atualiza o item e entra no histórico do contrato." @fechar="historicoAberto = false">
      <ol class="space-y-3">
        <li v-for="evento in historico" :key="evento.id" class="rounded-xl border border-line bg-white p-3 text-sm">
          <p class="font-semibold">{{ rotuloEvento(evento.tipoEvento) }} · {{ nomeAlimento(evento.alimentoId) }}</p>
          <p class="text-ink/70">{{ evento.numeroDocumento }} · {{ formatarData(evento.dataVigencia) }} · {{ evento.autorUsuarioId }}</p>
          <p class="mt-1">{{ evento.motivo }}</p>
          <p v-if="evento.valorNovo !== undefined" class="text-ink/70">
            Valor {{ evento.valorAnterior !== undefined ? `${moeda(evento.valorAnterior)} → ` : '' }}{{ moeda(evento.valorNovo) }}
          </p>
          <p v-if="evento.qtdNova !== undefined" class="text-ink/70">
            Quantidade {{ evento.qtdAnterior !== undefined ? `${numero(evento.qtdAnterior, 0)} → ` : '' }}{{ numero(evento.qtdNova, 0) }}
          </p>
        </li>
        <li v-if="historico.length === 0" class="text-sm text-ink/50">Ainda não há alterações registradas.</li>
      </ol>

      <form class="mt-6 space-y-3 border-t border-line pt-5" @submit.prevent="enviarAlteracao">
        <h3 class="font-semibold">Nova alteração</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm">
            Evento
            <select v-model="alteracao.tipoEvento" class="campo mt-1">
              <option v-for="tipo in TIPOS_EVENTO_ITEM" :key="tipo" :value="tipo">{{ rotuloEvento(tipo) }}</option>
            </select>
          </label>
          <label class="text-sm">
            Alimento
            <select v-model="alteracao.alimentoId" class="campo mt-1">
              <option v-for="alimento in alimentos" :key="alimento.id" :value="alimento.id">{{ alimento.nome }}</option>
            </select>
          </label>
          <label class="text-sm">
            Documento
            <input v-model="alteracao.numeroDocumento" required class="campo mt-1" />
          </label>
          <label class="text-sm">
            Data de vigência
            <input v-model="alteracao.dataVigencia" required type="date" class="campo mt-1" />
          </label>
          <label class="text-sm sm:col-span-2">
            Motivo
            <input v-model="alteracao.motivo" required class="campo mt-1" />
          </label>
          <label class="text-sm sm:col-span-2">
            Autor
            <input v-model="alteracao.autorUsuarioId" required class="campo mt-1" />
          </label>
          <template v-if="alteracao.tipoEvento === 'INCLUSAO_ALIMENTO'">
            <label class="text-sm">
              Unidade
              <select v-model="alteracao.unidadeMedida" class="campo mt-1">
                <option v-for="unidade in UNIDADES_MEDIDA" :key="unidade" :value="unidade">{{ rotuloUnidade(unidade) }}</option>
              </select>
            </label>
            <label class="text-sm">
              Valor unitário
              <input v-model.number="alteracao.valorNovo" type="number" min="0" step="0.01" class="campo mt-1" />
            </label>
            <label class="text-sm">
              Quantidade licitada
              <input v-model.number="alteracao.qtdNova" type="number" min="0" step="1" class="campo mt-1" />
            </label>
            <label class="text-sm">
              Dias de entrega
              <span class="mt-1 flex flex-wrap gap-2">
                <button
                  v-for="dia in [1, 2, 3, 4, 5]"
                  :key="dia"
                  type="button"
                  class="rounded-full border px-2 py-1 text-xs"
                  :class="alteracao.diasSemanaEntrega.includes(dia) ? 'border-leaf bg-moss' : 'border-line'"
                  @click="alternarDia(dia)"
                >
                  {{ ['', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex'][dia] }}
                </button>
              </span>
            </label>
          </template>
          <label v-if="alteracao.tipoEvento === 'REAJUSTE_PRECO'" class="text-sm">
            Novo valor unitário
            <input v-model.number="alteracao.valorNovo" type="number" min="0" step="0.01" class="campo mt-1" />
          </label>
          <label v-if="alteracao.tipoEvento === 'ACRESCIMO_QUANTIDADE'" class="text-sm">
            Nova quantidade total
            <input v-model.number="alteracao.qtdNova" type="number" min="0" step="1" class="campo mt-1" />
          </label>
        </div>
        <p v-if="erro" class="text-sm text-clay">{{ erro }}</p>
        <button type="submit" class="botao-primario">Registrar alteração</button>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { moeda, numero, rotuloEvento, rotuloUnidade, valorContratado } from '../../src/mocks/nutricao.mock'
import { TIPOS_EVENTO_ITEM, UNIDADES_MEDIDA } from '../../src/types/nutricao'
import type { ItemHortifruti } from '../../src/types/nutricao'

const { alimentos, contratos, eventos, empenhos, registrarAlteracao, salvarItensContrato, saldoItem } = useNutricao()

const contratoHortiId = ref('ct-kmj')
const historicoAberto = ref(false)
const erro = ref('')

const alteracao = reactive({
  tipoEvento: 'REAJUSTE_PRECO' as (typeof TIPOS_EVENTO_ITEM)[number],
  alimentoId: 'ali-laranja-pera',
  numeroDocumento: '',
  dataVigencia: '2026-11-18',
  motivo: '',
  autorUsuarioId: 'nutri.validacao',
  unidadeMedida: 'KG' as (typeof UNIDADES_MEDIDA)[number],
  valorNovo: 0,
  qtdNova: 0,
  diasSemanaEntrega: [1, 3, 5] as number[],
})

const selecionado = computed(() => contratos.value.find((contrato) => contrato.id === contratoHortiId.value) ?? contratos.value[0])
const historico = computed(() => eventos.value.filter((evento) => evento.contratoHortiId === selecionado.value?.id))
const empenhosDoContrato = computed(() => empenhos.value.filter((empenho) => empenho.contratoHortiId === selecionado.value?.id && empenho.ativo))

const itensEdicao = ref<ItemHortifruti[]>([])
const itensSujos = ref(false)
const salvandoItens = ref(false)
const erroItens = ref('')
const novoAlimentoId = ref('')

watch(selecionado, (contrato) => {
  itensEdicao.value = (contrato?.itens ?? []).map((item) => ({
    ...item,
    diasSemanaEntrega: [...item.diasSemanaEntrega],
  }))
  itensSujos.value = false
  erroItens.value = ''
  novoAlimentoId.value = ''
}, { immediate: true })

const alimentosDisponiveis = computed(() => {
  const usados = new Set(itensEdicao.value.map((item) => item.alimentoId))
  return alimentos.value.filter((alimento) => !usados.has(alimento.id) && alimento.ativo)
})

function marcarSujo() {
  itensSujos.value = true
  erroItens.value = ''
}

function alternarDiaItem(item: ItemHortifruti, dia: number) {
  if (item.diasSemanaEntrega.includes(dia)) item.diasSemanaEntrega = item.diasSemanaEntrega.filter((atual) => atual !== dia)
  else item.diasSemanaEntrega.push(dia)
  marcarSujo()
}

function adicionarItem() {
  const alimento = alimentos.value.find((item) => item.id === novoAlimentoId.value)
  if (!alimento) return
  itensEdicao.value.push({
    alimentoId: alimento.id,
    unidadeMedida: 'KG',
    qtdTotalLicitada: 0,
    valorUnitario: 0,
    perCapita: null,
    fatorCorrecao: null,
    diasSemanaEntrega: [1, 3, 5],
    ativo: true,
  })
  novoAlimentoId.value = ''
  marcarSujo()
}

function removerItem(indice: number) {
  itensEdicao.value.splice(indice, 1)
  marcarSujo()
}

async function salvarItens() {
  if (!selecionado.value) return
  salvandoItens.value = true
  erroItens.value = ''
  const erro = await salvarItensContrato(selecionado.value.id, itensEdicao.value.map((item) => ({ ...item, diasSemanaEntrega: [...item.diasSemanaEntrega] })))
  salvandoItens.value = false
  if (erro) {
    erroItens.value = erro
    return
  }
  itensSujos.value = false
}

function nomeAlimento(id: string) {
  return alimentos.value.find((alimento) => alimento.id === id)?.nome ?? id
}

function formatarData(valor: string) {
  const [ano, mes, dia] = valor.slice(0, 10).split('-')
  if (!ano || !mes || !dia) return valor
  return `${dia}/${mes}/${ano}`
}

function largura(alimentoId: string) {
  const saldo = saldoItem(selecionado.value?.id ?? '', alimentoId)
  if (saldo.licitada <= 0) return '0%'
  return `${Math.min(100, (saldo.empenhada / saldo.licitada) * 100)}%`
}

function alternarDia(dia: number) {
  if (alteracao.diasSemanaEntrega.includes(dia)) alteracao.diasSemanaEntrega = alteracao.diasSemanaEntrega.filter((item) => item !== dia)
  else alteracao.diasSemanaEntrega.push(dia)
}

async function enviarAlteracao() {
  if (!selecionado.value) return
  erro.value = (await registrarAlteracao(selecionado.value.id, { ...alteracao, diasSemanaEntrega: [...alteracao.diasSemanaEntrega] })) ?? ''
  if (!erro.value) {
    alteracao.numeroDocumento = ''
    alteracao.motivo = ''
  }
}
</script>

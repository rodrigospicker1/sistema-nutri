<template>
  <div>
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <label class="block flex-1 text-sm">
        Nome
        <input v-model="filtroNome" type="search" class="campo mt-1" placeholder="Buscar banana, batata, macarrão..." />
      </label>
      <label class="block text-sm sm:w-56">
        Categoria
        <select v-model="filtroCategoria" class="campo mt-1">
          <option value="">Todas</option>
          <option v-for="categoria in CATEGORIAS_ALIMENTO" :key="categoria" :value="categoria">{{ rotuloCategoria(categoria) }}</option>
        </select>
      </label>
      <NuxtLink to="/referencias-pnae" class="botao-secundario">Metas PNAE</NuxtLink>
      <button type="button" class="botao-primario" @click="abrirNovo">Novo alimento</button>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-line bg-white">
      <table class="w-full min-w-[42rem] text-left text-sm">
        <thead class="bg-cream text-xs tracking-wide text-ink/60 uppercase">
          <tr>
            <th class="px-4 py-3 font-semibold">Alimento</th>
            <th class="px-4 py-3 font-semibold">Categoria</th>
            <th class="px-4 py-3 font-semibold">Unidade</th>
            <th class="px-4 py-3 font-semibold">Grupos</th>
            <th class="px-4 py-3 font-semibold">kcal/100g</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="alimento in filtrados"
            :key="alimento.id"
            class="cursor-pointer border-t border-line hover:bg-moss/50"
            @click="editar(alimento)"
          >
            <td class="px-4 py-3 font-medium">{{ alimento.nome }}</td>
            <td class="px-4 py-3">{{ rotuloCategoria(alimento.categoria) }}</td>
            <td class="px-4 py-3">{{ rotuloUnidade(alimento.unidadeMedidaPadrao) }}</td>
            <td class="px-4 py-3">
              <span v-for="grupo in gruposDe(alimento)" :key="grupo.id" class="mr-1 inline-block rounded-full bg-cream px-2 py-0.5 text-xs">
                {{ grupo.origemRegra === 'LEI_PNAE' ? 'PNAE' : 'Contrato' }}
              </span>
            </td>
            <td class="px-4 py-3">{{ numero(alimento.composicaoNutricional.kcal, 0) }}</td>
          </tr>
          <tr v-if="filtrados.length === 0">
            <td colspan="5" class="px-4 py-10 text-center text-ink/50">Nenhum alimento com esse filtro.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <UiModal :aberto="painelAberto" painel titulo="Alimento" descricao="Campos para a equipe de nutrição conferir o cadastro completo." @fechar="painelAberto = false">
      <form class="space-y-5" @submit.prevent="salvar">
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm sm:col-span-2">
            Nome
            <input v-model="form.nome" required class="campo mt-1" />
          </label>
          <label class="text-sm">
            Categoria
            <select v-model="form.categoria" class="campo mt-1">
              <option v-for="categoria in CATEGORIAS_ALIMENTO" :key="categoria" :value="categoria">{{ rotuloCategoria(categoria) }}</option>
            </select>
          </label>
          <label class="text-sm">
            Unidade de medida padrão
            <select v-model="form.unidadeMedidaPadrao" class="campo mt-1">
              <option v-for="unidade in UNIDADES_MEDIDA" :key="unidade" :value="unidade">{{ unidade }} · {{ rotuloUnidade(unidade) }}</option>
            </select>
          </label>
        </div>

        <fieldset>
          <legend class="text-sm font-semibold">Grupos de incidência</legend>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="grupo in grupos"
              :key="grupo.id"
              type="button"
              class="rounded-full border px-3 py-1 text-xs"
              :class="form.gruposIncidenciaIds.includes(grupo.id) ? 'border-leaf bg-moss text-forest' : 'border-line bg-white'"
              @click="alternarGrupo(grupo.id)"
            >
              {{ grupo.nome }}
              <span class="text-ink/50">· {{ grupo.origemRegra === 'LEI_PNAE' ? 'Lei PNAE' : 'Contrato terceirizada' }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend class="text-sm font-semibold">Safra mensal</legend>
          <p class="mb-2 text-xs text-ink/60">Clique no mês para alternar safra plena, média produção e fora de safra.</p>
          <SafraMatrix v-model="form.safraMensal" />
        </fieldset>

        <fieldset>
          <legend class="text-sm font-semibold">Restrições por etapa FNDE</legend>
          <div v-for="(restricao, indice) in form.restricoesEtapaFnde" :key="indice" class="mt-2 grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1fr_1fr_auto]">
            <select v-model.number="restricao.erudioEtapaId" class="campo">
              <option v-for="etapa in etapas" :key="etapa.erudioEtapaId" :value="etapa.erudioEtapaId">{{ etapa.nome }}</option>
            </select>
            <select v-model="restricao.nivel" class="campo">
              <option v-for="nivel in NIVEIS_RESTRICAO" :key="nivel" :value="nivel">{{ nivel }}</option>
            </select>
            <button type="button" class="text-sm text-clay" @click="form.restricoesEtapaFnde.splice(indice, 1)">Remover</button>
            <input v-model="restricao.observacao" class="campo sm:col-span-3" placeholder="Observação" />
          </div>
          <button type="button" class="mt-2 text-sm font-semibold text-leaf" @click="adicionarRestricao">Adicionar restrição</button>
        </fieldset>

        <details class="rounded-xl border border-line bg-white p-3" open>
          <summary class="cursor-pointer text-sm font-semibold">Composição nutricional por 100 g (TACO)</summary>
          <div class="mt-3 grid gap-3 sm:grid-cols-3">
            <label v-for="nutriente in NUTRIENTES" :key="nutriente.chave" class="text-xs">
              {{ nutriente.rotulo }} ({{ nutriente.unidade }})
              <input v-model.number="form.composicaoNutricional[nutriente.chave]" type="number" min="0" step="0.1" class="campo mt-1" />
            </label>
          </div>
        </details>

        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.ativo" type="checkbox" class="size-4 accent-leaf" />
          Alimento ativo
        </label>

        <div class="flex justify-end gap-2">
          <button type="button" class="botao-secundario" @click="painelAberto = false">Cancelar</button>
          <button type="submit" class="botao-primario">Salvar alimento</button>
        </div>
      </form>
    </UiModal>
  </div>
</template>


<script setup lang="ts">
import { numero, rotuloCategoria, rotuloUnidade } from '../../src/mocks/nutricao.mock'
import { CATEGORIAS_ALIMENTO, NIVEIS_RESTRICAO, NUTRIENTES, UNIDADES_MEDIDA, type Alimento } from '../../src/types/nutricao'

const { alimentos, grupos, etapas, salvarAlimento, composicaoVazia, safraPadrao, novoId } = useNutricao()

const filtroNome = ref('')
const filtroCategoria = ref('')
const painelAberto = ref(false)
const form = reactive<Alimento>(alimentoVazio())

const filtrados = computed(() => {
  const nome = filtroNome.value.trim().toLocaleLowerCase('pt-BR')
  return alimentos.value.filter((alimento) => {
    const nomeOk = !nome || alimento.nome.toLocaleLowerCase('pt-BR').includes(nome)
    const categoriaOk = !filtroCategoria.value || alimento.categoria === filtroCategoria.value
    return nomeOk && categoriaOk
  })
})

function gruposDe(alimento: Alimento) {
  return grupos.value.filter((grupo) => alimento.gruposIncidenciaIds.includes(grupo.id))
}

function alimentoVazio(): Alimento {
  return {
    id: '',
    nome: '',
    categoria: 'FRUTA',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: [],
    composicaoNutricional: composicaoVazia(),
    safraMensal: safraPadrao(),
    restricoesEtapaFnde: [],
    ativo: true,
  }
}

function abrirNovo() {
  Object.assign(form, alimentoVazio())
  form.composicaoNutricional = composicaoVazia()
  form.safraMensal = safraPadrao()
  form.gruposIncidenciaIds = []
  form.restricoesEtapaFnde = []
  painelAberto.value = true
}

function editar(alimento: Alimento) {
  Object.assign(form, JSON.parse(JSON.stringify(alimento)))
  painelAberto.value = true
}

function alternarGrupo(id: string) {
  if (form.gruposIncidenciaIds.includes(id)) form.gruposIncidenciaIds = form.gruposIncidenciaIds.filter((item) => item !== id)
  else form.gruposIncidenciaIds.push(id)
}

function adicionarRestricao() {
  form.restricoesEtapaFnde.push({ erudioEtapaId: etapas[0]?.erudioEtapaId ?? 101, nivel: 'PERMITIDO', observacao: '' })
}

async function salvar() {
  if (!form.nome.trim()) return
  if (!form.id) form.id = novoId('ali')
  await salvarAlimento(JSON.parse(JSON.stringify(form)))
  painelAberto.value = false
}
</script>

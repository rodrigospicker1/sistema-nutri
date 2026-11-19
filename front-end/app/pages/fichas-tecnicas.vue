<template>
  <div class="grid gap-5 lg:grid-cols-[18rem_1fr]">
    <aside class="space-y-2">
      <button type="button" class="botao-primario w-full" @click="nova">Nova ficha</button>
      <button
        v-for="ficha in fichas"
        :key="ficha.id"
        type="button"
        class="block w-full rounded-2xl border px-4 py-3 text-left"
        :class="form.id === ficha.id ? 'border-leaf bg-moss' : 'border-line bg-white'"
        @click="carregar(ficha)"
      >
        <p class="font-semibold">{{ ficha.nome }}</p>
        <p class="text-xs text-ink/60">Rendimento {{ numero(ficha.rendimentoTotalGramas, 0) }} g</p>
      </button>
    </aside>

    <form class="space-y-5 rounded-2xl border border-line bg-white p-5" @submit.prevent="salvar">
      <div>
        <h2 class="font-serif text-3xl text-forest">{{ form.id ? 'Editar ficha' : 'Nova ficha' }}</h2>
        <p class="text-sm text-ink/65">O fator de correção de cada ingrediente é bruto dividido pelo líquido.</p>
      </div>
      <label class="block text-sm">
        Nome da receita
        <input v-model="form.nome" required class="campo mt-1" />
      </label>
      <label class="block text-sm">
        Modo de preparo
        <textarea v-model="form.modoPreparo" required rows="4" class="campo mt-1" />
      </label>
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="text-sm">
          Rendimento pronto (g)
          <p class="campo mt-1 cursor-not-allowed bg-ink/5 text-ink/70" aria-readonly="true">
            {{ numero(rendimentoCalculado, 1) }}
          </p>
          <p class="mt-1 text-xs text-ink/55">Calculado: soma dos líquidos × fator de cocção.</p>
        </div>
        <label class="text-sm">
          Fator de cocção
          <input v-model.number="form.fatorCoccao" required type="number" min="0" step="0.01" class="campo mt-1" />
        </label>
      </div>

      <fieldset>
        <legend class="text-sm font-semibold">Grupos de incidência (receita inteira)</legend>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="grupo in grupos"
            :key="grupo.id"
            type="button"
            class="rounded-full border px-3 py-1 text-xs"
            :class="form.gruposIncidenciaIds.includes(grupo.id) ? 'border-leaf bg-moss text-forest' : 'border-line bg-white'"
            @click="alternarGrupoFicha(grupo.id)"
          >
            {{ grupo.nome }}
          </button>
        </div>
      </fieldset>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <h3 class="font-semibold">Ingredientes</h3>
          <button type="button" class="text-sm font-semibold text-leaf" @click="adicionarIngrediente">Adicionar linha</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[40rem] text-left text-sm">
            <thead class="text-xs tracking-wide text-ink/50 uppercase">
              <tr>
                <th class="py-2">Alimento</th>
                <th class="py-2">Per capita líquido (g)</th>
                <th class="py-2">Fator de correção</th>
                <th class="py-2">Per capita bruto (g)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ingrediente, indice) in form.ingredientes" :key="ingrediente.id">
                <td class="py-1 pr-2">
                  <select v-model="ingrediente.alimentoId" class="campo">
                    <option v-for="alimento in alimentos" :key="alimento.id" :value="alimento.id">{{ alimento.nome }}</option>
                  </select>
                </td>
                <td class="py-1 pr-2">
                  <input v-model.number="ingrediente.perCapitaLiquido" type="number" min="0" step="0.1" class="campo" />
                </td>
                <td class="py-1 pr-2">
                  <input v-model.number="ingrediente.fatorCorrecao" type="number" min="0" step="0.01" class="campo" />
                </td>
                <td class="py-1 pr-2 font-semibold">
                  {{ numero(brutoCalculado(ingrediente), 1) }}
                </td>
                <td class="py-1">
                  <button type="button" class="text-clay" @click="form.ingredientes.splice(indice, 1)">Remover</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <h3 class="font-semibold">Porções por etapa</h3>
          <button type="button" class="text-sm font-semibold text-leaf" @click="adicionarPorcao">Adicionar etapa</button>
        </div>
        <div class="space-y-2">
          <div v-for="(porcao, indice) in form.porcoesEtapa" :key="indice" class="grid grid-cols-[1fr_8rem_auto] gap-2">
            <select v-model.number="porcao.erudioEtapaId" class="campo">
              <option v-for="etapa in etapas" :key="etapa.erudioEtapaId" :value="etapa.erudioEtapaId">{{ etapa.nome }}</option>
            </select>
            <input v-model.number="porcao.quantidadeGramas" type="number" min="1" class="campo" aria-label="Gramas da porção" />
            <button type="button" class="text-sm text-clay" @click="form.porcoesEtapa.splice(indice, 1)">Remover</button>
          </div>
        </div>
      </div>

      <button type="submit" class="botao-primario">Salvar ficha</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { numero } from '../../src/mocks/nutricao.mock'
import type { FichaTecnica } from '../../src/types/nutricao'

const { alimentos, fichas, grupos, etapas, salvarFicha, novoId } = useNutricao()
const primeira = fichas.value[0]
const form = reactive<FichaTecnica>(primeira ? JSON.parse(JSON.stringify(primeira)) : vazia())

function vazia(): FichaTecnica {
  return {
    id: '',
    nome: '',
    modoPreparo: '',
    rendimentoTotalGramas: 1000,
    fatorCoccao: 1,
    gruposIncidenciaIds: [],
    ingredientes: [],
    porcoesEtapa: [{ erudioEtapaId: 101, quantidadeGramas: 80 }],
  }
}

function carregar(ficha: FichaTecnica) {
  Object.assign(form, JSON.parse(JSON.stringify(ficha)))
  if (!form.gruposIncidenciaIds) form.gruposIncidenciaIds = []
}

function alternarGrupoFicha(id: string) {
  if (form.gruposIncidenciaIds.includes(id)) form.gruposIncidenciaIds = form.gruposIncidenciaIds.filter((item) => item !== id)
  else form.gruposIncidenciaIds.push(id)
}

function nova() {
  Object.assign(form, vazia())
  form.ingredientes = []
  form.porcoesEtapa = [{ erudioEtapaId: 101, quantidadeGramas: 80 }]
}

function adicionarIngrediente() {
  form.ingredientes.push({
    id: novoId('ing'),
    alimentoId: alimentos.value[0]?.id ?? '',
    perCapitaBruto: 0,
    perCapitaLiquido: 0,
    fatorCorrecao: 1,
  })
}

function adicionarPorcao() {
  form.porcoesEtapa.push({ erudioEtapaId: etapas[0]?.erudioEtapaId ?? 101, quantidadeGramas: 80 })
}

function fatorEfetivo(ingrediente: { perCapitaBruto: number; perCapitaLiquido: number; fatorCorrecao?: number }) {
  if (ingrediente.fatorCorrecao !== undefined) return ingrediente.fatorCorrecao
  return ingrediente.perCapitaLiquido > 0 ? ingrediente.perCapitaBruto / ingrediente.perCapitaLiquido : 1
}

function brutoCalculado(ingrediente: { perCapitaBruto: number; perCapitaLiquido: number; fatorCorrecao?: number }) {
  return Math.round((ingrediente.perCapitaLiquido ?? 0) * fatorEfetivo(ingrediente) * 100) / 100
}

const rendimentoCalculado = computed(() => {
  const base = form.ingredientes.reduce(
    (soma, ingrediente) => soma + (ingrediente.perCapitaLiquido ?? ingrediente.perCapitaBruto ?? 0),
    0,
  )
  const fatorCoc = Number(form.fatorCoccao) > 0 ? Number(form.fatorCoccao) : 0
  return Math.round(base * fatorCoc * 10) / 10
})

async function salvar() {
  if (!form.id) form.id = novoId('ft')
  form.rendimentoTotalGramas = rendimentoCalculado.value
  form.ingredientes = form.ingredientes.map((ingrediente) => ({
    ...ingrediente,
    perCapitaBruto: brutoCalculado(ingrediente),
  }))
  await salvarFicha(JSON.parse(JSON.stringify(form)))
}
</script>

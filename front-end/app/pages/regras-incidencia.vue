<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <button type="button" class="rounded-lg px-3 py-1.5 text-sm" :class="aba === 'matriz' ? 'bg-canopy text-white' : 'bg-white ring-1 ring-line'" @click="aba = 'matriz'">Matriz por etapa</button>
      <button type="button" class="rounded-lg px-3 py-1.5 text-sm" :class="aba === 'grupos' ? 'bg-canopy text-white' : 'bg-white ring-1 ring-line'" @click="aba = 'grupos'">Grupos de incidência</button>
    </div>

  <section v-if="aba === 'matriz'" class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label class="block flex-1 text-sm">
        Agrupamento (planilha)
        <select v-model="agrupamentoMatriz" class="campo mt-1">
          <option v-for="agrupamento in agrupamentosAtivos" :key="agrupamento.id" :value="agrupamento.id">
            {{ agrupamento.sigla }} — {{ agrupamento.nome }}
          </option>
        </select>
      </label>
      <button type="button" class="botao-primario" @click="abrirRegra()">Nova regra</button>
    </div>

    <div v-for="categoria in categoriasNaMatriz" :key="categoria" class="overflow-x-auto rounded-2xl border border-line bg-white">
      <div class="border-b border-line bg-cream px-4 py-2 font-semibold text-forest">{{ rotuloCategoria(categoria) }}</div>
      <table class="w-full min-w-[52rem] text-left text-sm">
        <thead class="text-xs tracking-wide text-ink/60 uppercase">
          <tr>
            <th class="px-4 py-2 font-semibold">Alvo</th>
            <th class="px-4 py-2 font-semibold">Tipo</th>
            <th class="px-4 py-2 font-semibold">Meta</th>
            <th class="px-3 py-2 font-semibold">SEM 1</th>
            <th class="px-3 py-2 font-semibold">SEM 2</th>
            <th class="px-3 py-2 font-semibold">SEM 3</th>
            <th class="px-3 py-2 font-semibold">SEM 4</th>
            <th class="px-3 py-2 font-semibold">SEM 5</th>
            <th class="px-3 py-2 font-semibold">Mês</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="regra in regrasDaCategoria(categoria)"
            :key="regra.id"
            class="cursor-pointer border-t border-line hover:bg-moss/40"
            @click="abrirRegra(regra)"
          >
            <td class="px-4 py-2 font-medium">{{ nomeAlvo(regra) }}</td>
            <td class="px-4 py-2 text-xs text-ink/70">{{ rotuloTipoAlvo(regra.tipoAlvo) }}</td>
            <td class="px-4 py-2">
              <span class="rounded-full px-2 py-0.5 text-xs" :class="regra.frequenciaMaxima === 0 ? 'bg-clay/15 font-semibold text-clay' : 'bg-cream'">
                {{ metaRotulo(regra) }}
              </span>
            </td>
            <td v-for="sem in 5" :key="sem" class="px-3 py-2 text-center text-xs text-ink/40">—</td>
            <td class="px-3 py-2 text-center text-xs text-ink/40">—</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!regrasDoAgrupamento.length" class="text-sm text-ink/50">Nenhuma regra cadastrada para este agrupamento.</p>
  </section>

    <section v-else>
      <div class="mb-4 flex justify-end">
        <button type="button" class="botao-primario" @click="abrirGrupo()">Novo grupo</button>
      </div>
      <div class="overflow-x-auto rounded-2xl border border-line bg-white">
        <table class="w-full min-w-[40rem] text-left text-sm">
          <thead class="bg-cream text-xs tracking-wide text-ink/60 uppercase">
            <tr>
              <th class="px-4 py-3 font-semibold">Grupo</th>
              <th class="px-4 py-3 font-semibold">Categoria</th>
              <th class="px-4 py-3 font-semibold">Origem</th>
              <th class="px-4 py-3 font-semibold">Alimentos</th>
              <th class="px-4 py-3 font-semibold">Fichas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grupo in grupos" :key="grupo.id" class="cursor-pointer border-t border-line hover:bg-moss/50" @click="abrirGrupo(grupo)">
              <td class="px-4 py-3 font-medium">{{ grupo.nome }}</td>
              <td class="px-4 py-3">{{ rotuloCategoria(grupo.categoriaVisual) }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-0.5 text-xs" :class="grupo.origemRegra === 'LEI_PNAE' ? 'bg-moss text-forest' : 'bg-cream'">
                  {{ grupo.origemRegra === 'LEI_PNAE' ? 'PNAE' : 'Contrato' }}
                </span>
              </td>
              <td class="px-4 py-3">{{ alimentosDoGrupo(grupo.id) }}</td>
              <td class="px-4 py-3">{{ fichasDoGrupo(grupo.id) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <UiModal :aberto="grupoAberto" painel titulo="Grupo de incidência" @fechar="grupoAberto = false">
      <form class="space-y-4" @submit.prevent="salvarGrupoForm">
        <label class="block text-sm">Nome <input v-model="grupoForm.nome" required class="campo mt-1" /></label>
        <label class="block text-sm">
          Categoria (planilha)
          <select v-model="grupoForm.categoriaVisual" class="campo mt-1">
            <option v-for="cat in CATEGORIAS_VISUAL_GRUPO" :key="cat" :value="cat">{{ rotuloCategoria(cat) }}</option>
          </select>
        </label>
        <label class="block text-sm">
          Origem
          <select v-model="grupoForm.origemRegra" class="campo mt-1">
            <option value="LEI_PNAE">Lei PNAE</option>
            <option value="CONTRATO_TERCEIRIZADA">Contrato terceirizada</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-sm"><input v-model="grupoForm.ativo" type="checkbox" /> Ativo</label>
        <button type="submit" class="botao-primario">Salvar</button>
      </form>
    </UiModal>

    <UiModal :aberto="regraAberta" painel titulo="Regra de frequência" @fechar="regraAberta = false">
      <form class="space-y-4" @submit.prevent="salvarRegraForm">
        <label class="block text-sm">
          Agrupamento
          <select v-model="regraForm.agrupamentoCardapioId" required class="campo mt-1">
            <option v-for="agrupamento in agrupamentosAtivos" :key="agrupamento.id" :value="agrupamento.id">{{ agrupamento.sigla }} — {{ agrupamento.nome }}</option>
          </select>
        </label>
        <label class="block text-sm">
          Tipo de alvo
          <select v-model="regraForm.tipoAlvo" class="campo mt-1">
            <option value="GRUPO">Grupo</option>
            <option value="FICHA_TECNICA">Ficha técnica</option>
            <option value="ALIMENTO">Alimento específico</option>
          </select>
        </label>
        <label v-if="regraForm.tipoAlvo === 'GRUPO'" class="block text-sm">
          Grupo
          <select v-model="regraForm.grupoIncidenciaId" required class="campo mt-1">
            <option v-for="grupo in grupos" :key="grupo.id" :value="grupo.id">{{ grupo.nome }}</option>
          </select>
        </label>
        <label v-else-if="regraForm.tipoAlvo === 'FICHA_TECNICA'" class="block text-sm">
          Ficha técnica
          <select v-model="regraForm.fichaTecnicaId" required class="campo mt-1">
            <option v-for="ficha in fichas" :key="ficha.id" :value="ficha.id">{{ ficha.nome }}</option>
          </select>
        </label>
        <label v-else class="block text-sm">
          Alimento
          <select v-model="regraForm.alimentoId" required class="campo mt-1">
            <option v-for="alimento in alimentos" :key="alimento.id" :value="alimento.id">{{ alimento.nome }}</option>
          </select>
        </label>
        <label class="block text-sm">
          Contrato
          <select v-model="regraForm.contratoTerceirizadaId" class="campo mt-1">
            <option value="">Lei do PNAE</option>
            <option :value="CONTRATO_COOPERAR_ID">Cooperar</option>
          </select>
        </label>
        <label class="block text-sm">
          Período
          <select v-model="regraForm.periodo" class="campo mt-1">
            <option value="SEMANAL">Semanal</option>
            <option value="MENSAL">Mensal</option>
          </select>
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm">Mínimo <input v-model="minimoTexto" type="number" min="0" class="campo mt-1" placeholder="Opcional" /></label>
          <label class="text-sm">Máximo <input v-model="maximoTexto" type="number" min="0" class="campo mt-1" placeholder="0 = proibido" /></label>
        </div>
        <p v-if="erroRegra" class="text-sm text-clay">{{ erroRegra }}</p>
        <button type="submit" class="botao-primario">Salvar</button>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { CONTRATO_COOPERAR_ID } from '../../src/mocks/nutricao.mock'
import { ROTULOS_CATEGORIA_VISUAL } from '../../src/mocks/validar-incidencias'
import { CATEGORIAS_VISUAL_GRUPO, type GrupoIncidencia, type IncidenciaRegra } from '../../src/types/nutricao'

const { alimentos, agrupamentos, fichas, grupos, regrasIncidencia, salvarGrupo, salvarRegra, novoId } = useNutricao()

const aba = ref<'matriz' | 'grupos'>('matriz')
const agrupamentoMatriz = ref('agr-bercario-1')
const grupoAberto = ref(false)
const regraAberta = ref(false)
const erroRegra = ref('')
const minimoTexto = ref('')
const maximoTexto = ref('')

const grupoForm = reactive<GrupoIncidencia>({
  id: '',
  nome: '',
  categoriaVisual: 'OUTROS',
  origemRegra: 'LEI_PNAE',
  ativo: true,
})
const regraForm = reactive<IncidenciaRegra>({
  id: '',
  contratoTerceirizadaId: null,
  tipoAlvo: 'GRUPO',
  grupoIncidenciaId: null,
  fichaTecnicaId: null,
  alimentoId: null,
  agrupamentoCardapioId: '',
  periodo: 'SEMANAL',
  frequenciaMinima: null,
  frequenciaMaxima: null,
  ativo: true,
})

const agrupamentosAtivos = computed(() => agrupamentos.value.filter((item) => item.ativo))
const regrasDoAgrupamento = computed(() => regrasIncidencia.value.filter((regra) => regra.ativo && regra.agrupamentoCardapioId === agrupamentoMatriz.value))

const categoriasNaMatriz = computed(() => {
  const ordem = [...CATEGORIAS_VISUAL_GRUPO]
  const usadas = new Set(regrasDoAgrupamento.value.map((regra) => categoriaDaRegra(regra)))
  return ordem.filter((cat) => usadas.has(cat))
})

function categoriaDaRegra(regra: IncidenciaRegra): string {
  if (regra.tipoAlvo === 'GRUPO' && regra.grupoIncidenciaId) {
    return grupos.value.find((grupo) => grupo.id === regra.grupoIncidenciaId)?.categoriaVisual ?? 'OUTROS'
  }
  return 'OUTROS'
}

function regrasDaCategoria(categoria: string) {
  return regrasDoAgrupamento.value.filter((regra) => categoriaDaRegra(regra) === categoria)
}

function rotuloCategoria(categoria: string) {
  return ROTULOS_CATEGORIA_VISUAL[categoria] ?? categoria
}

function rotuloTipoAlvo(tipo: IncidenciaRegra['tipoAlvo']) {
  if (tipo === 'GRUPO') return 'Grupo'
  if (tipo === 'FICHA_TECNICA') return 'Ficha'
  return 'Alimento'
}

function metaRotulo(regra: IncidenciaRegra) {
  const sufixo = regra.periodo === 'SEMANAL' ? 'sem' : 'mês'
  if (regra.frequenciaMaxima === 0) return 'PROIBIDO'
  if (regra.frequenciaMinima != null && regra.frequenciaMaxima != null) return `${regra.frequenciaMinima}-${regra.frequenciaMaxima}x ${sufixo}`
  if (regra.frequenciaMinima != null) return `mín. ${regra.frequenciaMinima}x ${sufixo}`
  if (regra.frequenciaMaxima != null) return `máx. ${regra.frequenciaMaxima}x ${sufixo}`
  return '—'
}

function alimentosDoGrupo(grupoId: string) {
  return alimentos.value.filter((alimento) => alimento.gruposIncidenciaIds.includes(grupoId)).length
}

function fichasDoGrupo(grupoId: string) {
  return fichas.value.filter((ficha) => ficha.gruposIncidenciaIds.includes(grupoId)).length
}

function nomeAlvo(regra: IncidenciaRegra) {
  if (regra.tipoAlvo === 'GRUPO') return grupos.value.find((grupo) => grupo.id === regra.grupoIncidenciaId)?.nome ?? 'Grupo'
  if (regra.tipoAlvo === 'FICHA_TECNICA') return fichas.value.find((ficha) => ficha.id === regra.fichaTecnicaId)?.nome ?? 'Ficha'
  return alimentos.value.find((alimento) => alimento.id === regra.alimentoId)?.nome ?? 'Alimento'
}

function abrirGrupo(grupo?: GrupoIncidencia) {
  grupoForm.id = grupo?.id ?? ''
  grupoForm.nome = grupo?.nome ?? ''
  grupoForm.categoriaVisual = grupo?.categoriaVisual ?? 'OUTROS'
  grupoForm.origemRegra = grupo?.origemRegra ?? 'LEI_PNAE'
  grupoForm.ativo = grupo?.ativo ?? true
  grupoAberto.value = true
}

async function salvarGrupoForm() {
  await salvarGrupo({ ...grupoForm, id: grupoForm.id || novoId('grp') })
  grupoAberto.value = false
}

function abrirRegra(regra?: IncidenciaRegra) {
  erroRegra.value = ''
  regraForm.id = regra?.id ?? ''
  regraForm.tipoAlvo = regra?.tipoAlvo ?? 'GRUPO'
  regraForm.contratoTerceirizadaId = regra?.contratoTerceirizadaId ?? ''
  regraForm.grupoIncidenciaId = regra?.grupoIncidenciaId ?? grupos.value[0]?.id ?? null
  regraForm.fichaTecnicaId = regra?.fichaTecnicaId ?? fichas.value[0]?.id ?? null
  regraForm.alimentoId = regra?.alimentoId ?? alimentos.value[0]?.id ?? null
  regraForm.agrupamentoCardapioId = regra?.agrupamentoCardapioId ?? agrupamentoMatriz.value
  regraForm.periodo = regra?.periodo ?? 'SEMANAL'
  regraForm.ativo = regra?.ativo ?? true
  minimoTexto.value = regra?.frequenciaMinima == null ? '' : String(regra.frequenciaMinima)
  maximoTexto.value = regra?.frequenciaMaxima == null ? '' : String(regra.frequenciaMaxima)
  regraAberta.value = true
}

function numeroOuNulo(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined || valor === '') return null
  if (typeof valor === 'number') return Number.isFinite(valor) && valor >= 0 ? valor : null
  const texto = String(valor).trim()
  if (texto === '') return null
  const numero = Number(texto)
  return Number.isFinite(numero) && numero >= 0 ? numero : null
}

async function salvarRegraForm() {
  const ids = {
    GRUPO: { grupoIncidenciaId: regraForm.grupoIncidenciaId, fichaTecnicaId: null, alimentoId: null },
    FICHA_TECNICA: { grupoIncidenciaId: null, fichaTecnicaId: regraForm.fichaTecnicaId, alimentoId: null },
    ALIMENTO: { grupoIncidenciaId: null, fichaTecnicaId: null, alimentoId: regraForm.alimentoId },
  }[regraForm.tipoAlvo]
  if (!ids.grupoIncidenciaId && !ids.fichaTecnicaId && !ids.alimentoId) {
    erroRegra.value = 'Selecione o alvo da regra.'
    return
  }
  await salvarRegra({
    ...regraForm,
    id: regraForm.id || novoId('reg'),
    contratoTerceirizadaId: regraForm.contratoTerceirizadaId || null,
    ...ids,
    frequenciaMinima: numeroOuNulo(minimoTexto.value),
    frequenciaMaxima: numeroOuNulo(maximoTexto.value),
  })
  regraAberta.value = false
}

watch(agrupamentosAtivos, (lista) => {
  if (!lista.some((item) => item.id === agrupamentoMatriz.value)) agrupamentoMatriz.value = lista[0]?.id ?? ''
}, { immediate: true })
</script>
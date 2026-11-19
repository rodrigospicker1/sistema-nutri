<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <div class="rounded-full bg-white p-1 ring-1 ring-line">
          <button type="button" class="rounded-full px-4 py-1.5 text-sm" :class="modo === 'MODELO' ? 'bg-forest text-white' : ''" @click="modo = 'MODELO'">Cardápio fixo</button>
          <button type="button" class="rounded-full px-4 py-1.5 text-sm" :class="modo === 'MENSAL' ? 'bg-forest text-white' : ''" @click="modo = 'MENSAL'">Cardápio mensal</button>
        </div>
        <select v-model.number="anoSel" class="campo w-auto">
          <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">{{ ano }}</option>
        </select>
        <select v-if="modo === 'MENSAL'" v-model.number="mesSel" class="campo w-auto">
          <option v-for="mes in MESES" :key="mes.valor" :value="mes.valor">{{ mes.nome }}</option>
        </select>
        <select v-model="etapaSel" class="campo w-auto min-w-56">
          <option v-for="agrupamento in agrupamentosAtivos" :key="agrupamento.id" :value="agrupamento.id">{{ agrupamento.sigla }} — {{ agrupamento.nome }}</option>
        </select>
        <button v-if="modo === 'MODELO'" type="button" class="botao-primario" @click="abrirNovoModelo">+ Novo cardápio modelo</button>
        <span v-if="atual" class="rounded-full px-3 py-1 text-xs font-semibold" :class="classeStatus(atual.status)">
          {{ atual.tipo === 'MODELO' ? 'Modelo' : rotuloStatusCardapio(atual.status) }}
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/referencias-pnae" class="botao-secundario">Metas PNAE</NuxtLink>
        <button v-if="atual" type="button" class="botao-secundario" @click="revisaoAberta = !revisaoAberta">
          {{ revisaoAberta ? 'Fechar revisão' : 'Revisar incidências' }}
        </button>
        <button v-if="modo === 'MENSAL'" type="button" class="botao-primario" @click="clonagemAberta = true">Clonar modelo para mês/ano</button>
        <button
          v-for="status in statusFluxo"
          v-show="modo === 'MENSAL'"
          :key="status"
          type="button"
          class="botao-secundario"
          @click="atual && mudarStatus(status)"
        >
          {{ rotuloStatusCardapio(status) }}
        </button>
      </div>
    </div>

    <section v-if="!atual" class="rounded-2xl border border-line bg-white p-6 text-center">
      <template v-if="modo === 'MENSAL'">
        <p class="font-semibold text-forest">Nenhum cardápio mensal para {{ nomeMes(mesSel) }}/{{ anoSel }} · {{ nomeAgrupamento(etapaSel) }}</p>
        <p class="mt-1 text-sm text-ink/60">O cardápio mensal é clonado do modelo fixo da etapa, que define as refeições e a estrutura da grade.</p>
        <button type="button" class="botao-primario mt-4" @click="abrirClonagem">Clonar modelo para este mês</button>
      </template>
      <template v-else>
        <p class="font-semibold text-forest">Nenhum cardápio modelo para {{ nomeAgrupamento(etapaSel) }} em {{ anoSel }}</p>
        <p class="mt-1 text-sm text-ink/60">Crie um novo cardápio modelo para esta etapa.</p>
        <button type="button" class="botao-primario mt-4" @click="abrirNovoModelo">+ Novo cardápio modelo</button>
      </template>
    </section>

    <div v-if="semanas.length" class="flex gap-2">
      <button
        v-for="semana in semanas"
        :key="semana"
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm"
        :class="semanaAtual === semana ? 'bg-canopy text-white' : 'bg-white ring-1 ring-line'"
        @click="semanaAtual = semana as 1 | 2 | 3 | 4 | 5"
      >
        Semana {{ semana }}
      </button>
    </div>

    <section
      v-if="!revisaoAberta && alertasSemana.length"
      class="rounded-2xl border px-4 py-3 text-sm"
      :class="alertasSemana.some((alerta) => alerta.nivel === 'ERRO') ? 'border-clay/40 bg-clay/10' : 'border-amber-300 bg-amber-50'"
    >
      <p
        v-for="(alerta, indice) in alertasSemana"
        :key="`${alerta.tipo}-${alerta.alvoNome}-${indice}`"
        class="py-0.5"
        :class="alerta.nivel === 'ERRO' ? 'font-medium text-clay' : 'text-ink'"
      >
        {{ alerta.mensagem }}
      </p>
    </section>

    <section
      v-if="!revisaoAberta && exibirSafra && avisosSafraAgrupados.length"
      class="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm"
    >
      <p class="font-semibold text-ink">Safra do mês</p>
      <div v-for="grupoMes in avisosSafraAgrupados" :key="grupoMes.mes" class="mt-2">
        <p class="font-medium text-ink/80">{{ nomeMes(grupoMes.mes) }}</p>
        <ul class="mt-1 space-y-1 pl-4">
          <li v-for="grupo in grupoMes.grupos" :key="grupo.status" class="flex gap-2">
            <span class="shrink-0 font-semibold" :class="classeSafra(grupo.status)">{{ rotuloSafra(grupo.status) }}:</span>
            <span class="text-ink/80">
              <template v-for="(item, indice) in grupo.itens" :key="item.nome">
                <template v-if="indice > 0">; </template>{{ item.nome }} <span class="text-ink/50">({{ item.dias.map((dia) => nomeDia(dia)).join(', ') }})</span>
              </template>
            </span>
          </li>
        </ul>
      </div>
    </section>

    <section v-if="revisaoAberta && atual" class="overflow-x-auto rounded-2xl border border-line bg-white p-4">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 class="font-semibold text-forest">Revisão de incidências — {{ siglaAgrupamento }}</h2>
        <p class="text-xs text-ink/60">Semana em destaque: {{ semanaAtual }}. Regras mensais na coluna Mês.</p>
      </div>
      <table class="w-full min-w-[56rem] text-left text-sm">
        <thead class="bg-cream text-xs uppercase tracking-wide text-ink/60">
          <tr>
            <th class="px-2 py-2">Alvo</th>
            <th class="px-2 py-2">Meta</th>
            <th v-for="sem in 5" :key="sem" class="px-2 py-2 text-center">SEM {{ sem }}</th>
            <th class="px-2 py-2 text-center">Mês</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="linha in resultadoIncidencia.revisao" :key="linha.regraId" class="border-t border-line">
            <td class="px-2 py-2">
              <p class="font-medium">{{ linha.alvoNome }}</p>
              <p class="text-xs text-ink/50">{{ linha.tipoAlvo }} · {{ rotuloCategoriaRevisao(linha.categoriaVisual) }}</p>
            </td>
            <td class="px-2 py-2 text-xs">{{ linha.metaRotulo }}</td>
            <td v-for="sem in 5" :key="sem" class="px-2 py-2 text-center">
              <span class="inline-block min-w-10 rounded-md px-1.5 py-0.5 text-xs font-semibold" :class="classeCelula(linha, sem)">
                {{ linha.contagemSemanas[sem] ?? 0 }}
              </span>
            </td>
            <td class="px-2 py-2 text-center">
              <span class="inline-block min-w-10 rounded-md px-1.5 py-0.5 text-xs font-semibold" :class="classeCelulaMes(linha)">
                {{ linha.contagemMensal }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="atual" class="overflow-x-auto rounded-2xl border border-line bg-white">
      <table class="w-full min-w-[68rem] border-collapse text-sm">
        <thead>
          <tr class="bg-cream">
            <th class="w-40 border-b border-line px-3 py-3 text-left">Refeição</th>
            <th v-for="dia in diasDaSemana" :key="dia.diaSemana" class="border-b border-l border-line px-2 py-2 text-left align-top">
              <p class="font-semibold">
                {{ nomeDia(dia.diaSemana) }}<span v-if="dia.data" class="ml-1 text-ink/50">{{ Number(dia.data.slice(8, 10)) }}</span>
              </p>
              <select
                class="mt-1 w-full rounded-md border border-line bg-white px-2 py-1 text-xs"
                :class="foraDoMes(dia) ? 'opacity-50' : ''"
                :disabled="foraDoMes(dia)"
                :value="dia.tipoDia"
                @change="alterarTipoDia(dia.diaSemana, ($event.target as HTMLSelectElement).value as DiaGrade['tipoDia'])"
              >
                <option v-for="tipo in TIPOS_DIA" :key="tipo" :value="tipo">{{ rotuloTipoDia(tipo) }}</option>
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="refeicao in refeicoesGrade" :key="refeicao.id">
            <th class="border-t border-line bg-paper px-3 py-3 text-left text-xs font-semibold tracking-wide uppercase">{{ refeicao.nome }}</th>
            <td v-for="dia in diasDaSemana" :key="`${dia.diaSemana}-${refeicao.id}`" class="border-t border-l border-line align-top">
              <div v-if="dia.tipoDia !== 'LETIVO' || foraDoMes(dia)" class="flex h-full min-h-28 items-center justify-center px-2 text-center text-xs font-semibold text-ink/45">
                {{ foraDoMes(dia) ? 'Fora do mês' : rotuloTipoDia(dia.tipoDia) }}
              </div>
              <div v-else class="min-h-28 p-2">
                <ul class="space-y-1">
                  <li v-for="item in itensDa(dia, refeicao.id)" :key="item.id" class="flex items-start justify-between gap-1 rounded-md bg-moss/70 px-2 py-1">
                    <span>
                      <strong v-if="item.operador" class="mr-1 text-leaf">{{ item.operador }}</strong>
                      {{ nomeItem(item) }}
                      <span v-if="item.perCapitaLiquido" class="text-ink/55">· {{ item.perCapitaLiquido }} g</span>
                      <span
                        v-if="exibirSafra && statusSafraItem(item, mesDoDia(dia))"
                        class="ml-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                        :class="classeSafra(statusSafraItem(item, mesDoDia(dia))!)"
                        :title="`Safra em ${nomeMes(mesDoDia(dia))}: ${rotuloSafra(statusSafraItem(item, mesDoDia(dia))!)}. Verifique a disponibilidade do alimento.`"
                      >
                        {{ siglaSafra(statusSafraItem(item, mesDoDia(dia))!) }}
                      </span>
                    </span>
                    <button type="button" class="text-clay" :aria-label="`Remover ${nomeItem(item)}`" @click="removerItem(dia.diaSemana, refeicao.id, item.id)">×</button>
                  </li>
                </ul>
                <button type="button" class="mt-2 text-xs font-semibold text-leaf" @click="abrirItem(dia, refeicao.id)">Adicionar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <section v-if="atual" class="rounded-2xl border border-line bg-white p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-serif text-2xl text-forest">Composição nutricional · média semanal</h2>
          <p class="text-sm text-ink/65">
            Semana {{ semanaAtual }} · {{ media.diasLetivos }} dia(s) letivo(s).
            Itens com OU entram pela média das opções; itens com E somam.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <p
            v-if="referencia && media.diasLetivos > 0"
            class="rounded-full px-4 py-2 text-sm font-semibold"
            :class="calculoOk ? 'bg-moss text-leaf' : 'bg-honey-soft text-clay'"
          >
            {{ calculoOk ? 'Cálculo OK' : 'Fora da meta' }}
          </p>
          <button type="button" class="botao-secundario" @click="abrirMeta">
            {{ referencia ? 'Editar meta' : 'Cadastrar meta' }}
          </button>
        </div>
      </div>
      <p v-if="!referencia" class="mt-4 text-sm text-ink/60">Não há meta PNAE ativa para {{ nomeAgrupamento(atual.agrupamentoCardapioId) }}.</p>
      <p v-else-if="media.diasLetivos === 0" class="mt-4 text-sm text-ink/60">Sem dias letivos nesta semana.</p>
      <div v-else class="mt-4 overflow-x-auto">
        <table class="w-full min-w-[40rem] text-left text-sm">
          <thead class="text-xs tracking-wide text-ink/50 uppercase">
            <tr>
              <th class="py-2">Nutriente</th>
              <th class="py-2">Média do dia</th>
              <th class="py-2">Meta {{ referencia.descricaoFaixa }}</th>
              <th class="py-2">Situação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="faixa in comparacao" :key="faixa.chave" class="border-t border-line" :class="faixa.ok ? '' : 'bg-honey-soft/70'">
              <td class="py-2">{{ faixa.rotulo }}</td>
              <td class="py-2">{{ numero(faixa.valor, 1) }} {{ faixa.unidade }}</td>
              <td class="py-2">{{ numero(faixa.min, 0) }}–{{ numero(faixa.max, 0) }}</td>
              <td class="py-2 font-semibold" :class="faixa.ok ? 'text-leaf' : 'text-clay'">{{ faixa.ok ? 'Dentro' : 'Fora' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="atual.observacoesCozinha || nutricionistasDoCardapio.length" class="mt-5 border-t border-line pt-4 text-sm text-ink/75">
        <p v-if="nutricionistasDoCardapio.length">Responsáveis: {{ nutricionistasDoCardapio.map((pessoa) => pessoa.nome).join(', ') }}</p>
        <p v-if="atual.observacoesCozinha" class="mt-1">{{ atual.observacoesCozinha }}</p>
      </div>
    </section>

    <UiModal :aberto="modeloAberto" painel titulo="Novo cardápio modelo" descricao="Modelo fixo da etapa: define as refeições e a estrutura base dos cardápios mensais clonados a partir dele. A grade nasce vazia, de segunda a sexta." @fechar="modeloAberto = false">
      <form class="space-y-4" @submit.prevent="confirmarModelo">
        <label class="block text-sm">
          Nome
          <input v-model="modelo.nome" required class="campo mt-1" placeholder="Cardápio Fixo 2026 - Maternal" />
        </label>
        <label class="block text-sm">
          Agrupamento
          <select v-model="modelo.agrupamentoCardapioId" class="campo mt-1">
            <option v-for="agrupamento in agrupamentosAtivos" :key="agrupamento.id" :value="agrupamento.id">{{ agrupamento.nome }}</option>
          </select>
        </label>
        <p v-if="etapasDoAgrupamento" class="text-xs text-ink/60">Etapas: {{ etapasDoAgrupamento }}</p>
        <button type="button" class="text-sm font-semibold text-leaf" @click="agrupamentoNovo.aberto = !agrupamentoNovo.aberto">
          {{ agrupamentoNovo.aberto ? 'Fechar novo agrupamento' : 'Criar agrupamento' }}
        </button>
        <div v-if="agrupamentoNovo.aberto" class="space-y-3 rounded-xl bg-cream p-3">
          <label class="block text-sm">
            Nome do agrupamento
            <input v-model="agrupamentoNovo.nome" class="campo mt-1" placeholder="Maternal integral" />
          </label>
          <fieldset>
            <legend class="text-sm font-semibold">Etapas do Erudio</legend>
            <div v-for="curso in cursosErudio" :key="curso.nome" class="mt-2">
              <p class="text-xs font-semibold tracking-wide text-ink/50 uppercase">{{ curso.nome }}</p>
              <div class="mt-1 flex flex-wrap gap-2">
                <label v-for="etapa in curso.etapas" :key="etapa.erudioEtapaId" class="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs">
                  <input type="checkbox" :checked="agrupamentoNovo.etapas.includes(etapa.erudioEtapaId)" @change="alternarEtapa(etapa.erudioEtapaId)" />
                  {{ etapa.nome }}
                </label>
              </div>
            </div>
          </fieldset>
          <button type="button" class="botao-secundario" @click="salvarAgrupamento">Usar este agrupamento</button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <label class="block text-sm">
            Ano de referência
            <select v-model.number="modelo.ano" class="campo mt-1">
              <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">{{ ano }}</option>
            </select>
          </label>
          <label class="block text-sm">
            Semanas
            <select v-model.number="modelo.quantidadeSemanas" class="campo mt-1">
              <option v-for="quantidade in [1, 2, 3, 4, 5]" :key="quantidade" :value="quantidade">{{ quantidade }} {{ quantidade === 1 ? 'semana' : 'semanas' }}</option>
            </select>
          </label>
        </div>
        <fieldset>
          <legend class="text-sm font-semibold">Refeições</legend>
          <div class="mt-2 grid gap-2 sm:grid-cols-2">
            <label v-for="refeicao in REFEICOES" :key="refeicao.id" class="flex items-center gap-2 text-sm">
              <input type="checkbox" :checked="modelo.refeicoes.includes(refeicao.id)" @change="alternarRefeicao(refeicao.id)" />
              {{ refeicao.nome }}
            </label>
          </div>
        </fieldset>
        <label class="block text-sm">
          Observações da cozinha
          <textarea v-model="modelo.observacoesCozinha" rows="4" class="campo mt-1" />
        </label>
        <fieldset>
          <legend class="text-sm font-semibold">Nutricionistas responsáveis</legend>
          <div class="mt-2 space-y-1">
            <label v-for="pessoa in nutricionistas" :key="pessoa.erudioUsuarioId" class="flex items-center gap-2 text-sm">
              <input type="checkbox" :checked="modelo.nutricionistasResponsaveisIds.includes(pessoa.erudioUsuarioId)" @change="alternarNutricionista(pessoa.erudioUsuarioId)" />
              {{ pessoa.nome }}
            </label>
          </div>
        </fieldset>
        <p v-if="erroModelo" class="text-sm text-clay">{{ erroModelo }}</p>
        <button type="submit" class="botao-primario">Criar cardápio</button>
      </form>
    </UiModal>

    <ReferenciaPnaeModal :aberto="metaAberta" :referencia-id="metaId" :agrupamento-inicial-id="atual?.agrupamentoCardapioId" @fechar="metaAberta = false" />

    <UiModal :aberto="clonagemAberta" titulo="Clonar modelo" descricao="O cardápio modelo fixo define as refeições e a estrutura da grade. A cópia nasce com status Novo." @fechar="clonagemAberta = false">
      <form class="space-y-3" @submit.prevent="clonar">
        <div class="rounded-xl bg-cream px-4 py-3 text-sm">
          <p><span class="font-semibold">Etapa:</span> {{ nomeAgrupamento(etapaSel) }}</p>
          <p><span class="font-semibold">Mês/Ano:</span> {{ nomeMes(mesSel) }}/{{ anoSel }}</p>
          <p v-if="modeloParaClonar" class="mt-1 text-ink/70">Modelo de origem: {{ modeloParaClonar.nome }}</p>
          <p v-else class="mt-1 font-medium text-clay">Nenhum cardápio modelo cadastrado para esta etapa em {{ anoSel }}.</p>
        </div>
        <button type="submit" class="botao-primario" :disabled="!modeloParaClonar">Criar cardápio mensal</button>
      </form>
    </UiModal>

    <UiModal :aberto="Boolean(celula)" titulo="Adicionar item" descricao="Escolha uma ficha técnica ou um alimento de hortifruti. A partir do segundo item, diga se entra com E ou OU." @fechar="celula = null">
      <form class="space-y-4" @submit.prevent="confirmarItem">
        <fieldset v-if="jaTemItem" class="flex gap-3 text-sm">
          <legend class="mb-2 font-semibold">Operador</legend>
          <label class="flex items-center gap-2"><input v-model="draft.operador" type="radio" value="E" /> E — os dois são servidos</label>
          <label class="flex items-center gap-2"><input v-model="draft.operador" type="radio" value="OU" /> OU — uma das opções</label>
        </fieldset>
        <fieldset class="flex gap-3 text-sm">
          <legend class="mb-2 font-semibold">Origem</legend>
          <label class="flex items-center gap-2"><input v-model="draft.origem" type="radio" value="FICHA" /> Ficha técnica</label>
          <label class="flex items-center gap-2"><input v-model="draft.origem" type="radio" value="ALIMENTO" /> Alimento hortifruti</label>
        </fieldset>
        <label v-if="draft.origem === 'FICHA'" class="block text-sm">
          Ficha
          <select v-model="draft.fichaId" class="campo mt-1">
            <option v-for="ficha in fichas" :key="ficha.id" :value="ficha.id">{{ ficha.nome }}</option>
          </select>
        </label>
        <label v-if="draft.origem === 'FICHA'" class="block text-sm">
          Porção servida (g prontos)
          <input v-model.number="draft.porcaoServidaGramas" type="number" min="1" step="1" class="campo mt-1" :placeholder="porcaoPadraoFicha" />
          <span class="mt-1 block text-xs text-ink/55">Vazio = receita-base inteira ({{ porcaoPadraoFicha }} g).</span>
        </label>
        <template v-else>
          <label class="block text-sm">
            Alimento
            <select v-model="draft.alimentoId" class="campo mt-1">
              <option v-for="alimento in alimentosHortifruti" :key="alimento.id" :value="alimento.id">{{ alimento.nome }}</option>
            </select>
          </label>
          <label class="block text-sm">
            Per capita líquido (g)
            <input v-model.number="draft.perCapitaLiquido" type="number" min="1" step="1" class="campo mt-1" />
          </label>
        </template>
        <p v-if="avisoSafraDraft" class="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-ink">
          {{ avisoSafraDraft }}
        </p>
        <p v-if="erroItem" class="rounded-lg border border-clay/40 bg-clay/10 px-3 py-2 text-sm text-clay">
          {{ erroItem }}
        </p>
        <button type="submit" class="botao-primario">Incluir na refeição</button>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import {
  FAIXAS_COMPARACAO,
  OBSERVACOES_COZINHA_PADRAO,
  nomeEtapa,
  nomeMes,
  numero,
  rotuloSafra,
  rotuloStatusCardapio,
  rotuloTipoDia,
} from '../../src/mocks/nutricao.mock'
import { MESES, REFEICOES, TIPOS_DIA, type DiaGrade, type ItemGrade, type RefeicaoId, type StatusCardapio, type StatusSafra } from '../../src/types/nutricao'

import { ROTULOS_CATEGORIA_VISUAL, validarIncidenciasCardapio, type LinhaRevisaoIncidencia } from '../../src/mocks/validar-incidencias'

const { alimentos, cardapios, agrupamentos, contratos, fichas, grupos, regrasIncidencia, referencias, etapas, adicionarItemGrade, removerItemGrade, definirTipoDia, definirStatus, criarAgrupamento, criarCardapioModelo, clonarModelo, mediaSemanal } = useNutricao()
const { nutricionistas, etapas: etapasErudio, nomeEtapa: nomeEtapaErudio } = useErudioMock()

const modo = ref<'MODELO' | 'MENSAL'>('MENSAL')
const cardapioId = ref('card-mensal-b1')
const semanaAtual = ref<1 | 2 | 3 | 4 | 5>(1)
const revisaoAberta = ref(false)
const clonagemAberta = ref(false)
const celula = ref<{ diaSemana: number; refeicao: RefeicaoId } | null>(null)
const erroItem = ref('')
const draft = reactive({
  origem: 'FICHA' as 'FICHA' | 'ALIMENTO',
  operador: 'E' as 'E' | 'OU',
  fichaId: 'ft-suco-laranja',
  alimentoId: 'ali-banana-prata',
  perCapitaLiquido: 40,
  porcaoServidaGramas: undefined as number | undefined,
})

const fichaSelecionada = computed(() => fichas.value.find((ficha) => ficha.id === draft.fichaId))
const porcaoPadraoFicha = computed(() => numero(fichaSelecionada.value?.rendimentoTotalGramas ?? 0, 0))

const modeloAberto = ref(false)
const metaAberta = ref(false)
const metaId = ref<string | null>(null)
const erroModelo = ref('')
const modelo = reactive({
  nome: '',
  ano: new Date().getFullYear(),
  agrupamentoCardapioId: 'agr-bercario-1',
  quantidadeSemanas: 5 as 1 | 2 | 3 | 4 | 5,
  refeicoes: REFEICOES.map((refeicao) => refeicao.id),
  observacoesCozinha: OBSERVACOES_COZINHA_PADRAO,
  nutricionistasResponsaveisIds: [124799] as number[],
})
const agrupamentoNovo = reactive({ aberto: false, nome: '', etapas: [] as number[] })

const statusFluxo: StatusCardapio[] = ['NOVO', 'EM_ALTERACAO', 'EM_ANALISE_EMPRESA', 'PRONTO']
const anoSel = ref(new Date().getFullYear())
const mesSel = ref(new Date().getMonth() + 1)
const etapaSel = ref('')

const modelos = computed(() => cardapios.value.filter((cardapio) => cardapio.tipo === 'MODELO'))
const modeloParaClonar = computed(() => {
  const daEtapa = modelos.value.filter((item) => item.agrupamentoCardapioId === etapaSel.value)
  return daEtapa.find((item) => item.ano === anoSel.value) ?? daEtapa.find((item) => !item.ano) ?? daEtapa[0]
})
const agrupamentosAtivos = computed(() => agrupamentos.value.filter((item) => item.ativo))
const anosDisponiveis = computed(() => {
  const anos = new Set<number>([new Date().getFullYear()])
  for (const cardapio of cardapios.value) {
    if (cardapio.ano) anos.add(cardapio.ano)
  }
  return [...anos].sort((a, b) => b - a)
})

watch(agrupamentosAtivos, (lista) => {
  if (!etapaSel.value || !lista.some((item) => item.id === etapaSel.value)) etapaSel.value = lista[0]?.id ?? ''
}, { immediate: true })

const visiveis = computed(() => cardapios.value.filter((cardapio) => {
  if (cardapio.tipo !== modo.value) return false
  if (modo.value === 'MENSAL') {
    if ((cardapio.ano ?? 0) !== anoSel.value || cardapio.mes !== mesSel.value) return false
  } else if (cardapio.ano && cardapio.ano !== anoSel.value) {
    return false
  }
  if (etapaSel.value && cardapio.agrupamentoCardapioId && cardapio.agrupamentoCardapioId !== etapaSel.value) return false
  return true
}))
const atual = computed(() => visiveis.value.find((cardapio) => cardapio.id === cardapioId.value) ?? visiveis.value[0])
const semanas = computed(() => {
  const numeros = [...new Set(atual.value?.dias.map((dia) => dia.numeroSemana) ?? [])]
  return numeros.sort((a, b) => a - b)
})
const refeicoesGrade = computed(() => {
  const ids = atual.value?.refeicoes
  if (!ids?.length) return [...REFEICOES]
  return REFEICOES.filter((refeicao) => ids.includes(refeicao.id))
})
const diasDaSemana = computed(() => atual.value?.dias.filter((dia) => dia.numeroSemana === semanaAtual.value) ?? [])
const resultadoIncidencia = computed(() => {
  if (!atual.value) return { valido: true, alertas: [] }
  return validarIncidenciasCardapio({
    cardapio: atual.value,
    regras: regrasIncidencia.value,
    grupos: grupos.value,
    alimentos: alimentos.value,
    fichas: fichas.value,
  })
})
const alertasSemana = computed(() => resultadoIncidencia.value.alertas.filter((alerta) => alerta.numeroSemana == null || alerta.numeroSemana === semanaAtual.value))
const siglaAgrupamento = computed(() => {
  const id = atual.value?.agrupamentoCardapioId
  return agrupamentos.value.find((item) => item.id === id)?.sigla ?? 'Etapa'
})

function rotuloCategoriaRevisao(categoria: string) {
  return ROTULOS_CATEGORIA_VISUAL[categoria] ?? categoria
}

function classeCelula(linha: LinhaRevisaoIncidencia, semana: number) {
  const status = linha.statusSemanas[semana] ?? 'OK'
  if (status === 'OK') return semana === semanaAtual.value ? 'bg-moss text-forest' : 'bg-moss/40 text-forest'
  if (status === 'INSUFICIENTE') return 'bg-amber-100 text-amber-900'
  return 'bg-clay/20 text-clay'
}

function classeCelulaMes(linha: LinhaRevisaoIncidencia) {
  const status = linha.statusMensal
  if (status === 'OK') return 'bg-moss text-forest'
  if (status === 'INSUFICIENTE') return 'bg-amber-100 text-amber-900'
  return 'bg-clay/20 text-clay'
}
const media = computed(() => (atual.value ? mediaSemanal(atual.value, semanaAtual.value) : { diasLetivos: 0, media: null }))
const referencia = computed(() => referencias.value.find((faixa) => faixa.ativo && faixa.agrupamentoCardapioId === atual.value?.agrupamentoCardapioId))
const cursosErudio = computed(() => [
  { nome: 'Educação infantil', etapas: etapasErudio.value.filter((etapa) => etapa.cursoId === 11) },
  { nome: 'Ensino fundamental', etapas: etapasErudio.value.filter((etapa) => etapa.cursoId === 10) },
])
const etapasDoAgrupamento = computed(() => {
  const agrupamento = agrupamentos.value.find((item) => item.id === modelo.agrupamentoCardapioId)
  if (!agrupamento) return ''
  return agrupamento.erudioEtapaIds.map((id) => nomeEtapaResolvido(id)).join(', ')
})
const nutricionistasDoCardapio = computed(() =>
  nutricionistas.value.filter((pessoa) => atual.value?.nutricionistasResponsaveisIds?.includes(pessoa.erudioUsuarioId)),
)

const comparacao = computed(() => {
  const meta = referencia.value
  const valores = media.value.media
  if (!meta || !valores) return []
  return FAIXAS_COMPARACAO.map((faixa) => {
    const min = meta[`${faixa.chave}Min`]
    const max = meta[`${faixa.chave}Max`]
    const valor = valores[faixa.origem]
    return { ...faixa, valor, min, max, ok: valor >= min && valor <= max }
  })
})

const calculoOk = computed(() => comparacao.value.length > 0 && comparacao.value.every((faixa) => faixa.ok))
const jaTemItem = computed(() => {
  if (!celula.value || !atual.value) return false
  const dia = atual.value.dias.find((item) => item.numeroSemana === semanaAtual.value && item.diaSemana === celula.value?.diaSemana)
  return (dia?.refeicoes.find((refeicao) => refeicao.refeicao === celula.value?.refeicao)?.itens.length ?? 0) > 0
})

const alimentosHortifruti = computed(() => {
  const ids = new Set(
    contratos.value.flatMap((contrato) => contrato.itens.filter((item) => item.ativo).map((item) => item.alimentoId)),
  )
  return alimentos.value.filter((alimento) => ids.has(alimento.id))
})

watch(modo, () => {
  cardapioId.value = visiveis.value[0]?.id ?? ''
})

watch(semanas, (lista) => {
  if (lista.length && !lista.includes(semanaAtual.value)) semanaAtual.value = (lista[0] ?? 1) as 1 | 2 | 3 | 4 | 5
})

function nomeEtapaResolvido(id: number) {
  return etapas.find((etapa) => etapa.erudioEtapaId === id)?.nome ?? nomeEtapaErudio(id)
}

function nomeAgrupamento(id?: string) {
  return agrupamentos.value.find((item) => item.id === id)?.nome ?? nomeEtapa(atual.value?.erudioEtapaId ?? 0)
}

function abrirClonagem() {
  clonagemAberta.value = true
}

function abrirNovoModelo() {
  erroModelo.value = ''
  modelo.nome = ''
  modelo.ano = anoSel.value
  modelo.quantidadeSemanas = 5
  modelo.refeicoes = REFEICOES.map((refeicao) => refeicao.id)
  modelo.observacoesCozinha = OBSERVACOES_COZINHA_PADRAO
  modelo.nutricionistasResponsaveisIds = nutricionistas.value[0] ? [nutricionistas.value[0].erudioUsuarioId] : []
  modelo.agrupamentoCardapioId = agrupamentosAtivos.value[0]?.id ?? ''
  agrupamentoNovo.aberto = false
  agrupamentoNovo.nome = ''
  agrupamentoNovo.etapas = []
  modeloAberto.value = true
}

function alternarEtapa(id: number) {
  if (agrupamentoNovo.etapas.includes(id)) agrupamentoNovo.etapas = agrupamentoNovo.etapas.filter((etapa) => etapa !== id)
  else agrupamentoNovo.etapas.push(id)
}

function alternarRefeicao(id: RefeicaoId) {
  if (modelo.refeicoes.includes(id)) modelo.refeicoes = modelo.refeicoes.filter((refeicao) => refeicao !== id)
  else modelo.refeicoes.push(id)
}

function alternarNutricionista(id: number) {
  if (modelo.nutricionistasResponsaveisIds.includes(id)) {
    modelo.nutricionistasResponsaveisIds = modelo.nutricionistasResponsaveisIds.filter((pessoa) => pessoa !== id)
  } else modelo.nutricionistasResponsaveisIds.push(id)
}

async function salvarAgrupamento() {
  const id = await criarAgrupamento(agrupamentoNovo.nome, agrupamentoNovo.etapas)
  if (!id) {
    erroModelo.value = 'O agrupamento precisa de nome e de ao menos uma etapa.'
    return
  }
  erroModelo.value = ''
  modelo.agrupamentoCardapioId = id
  agrupamentoNovo.aberto = false
  agrupamentoNovo.nome = ''
  agrupamentoNovo.etapas = []
}

async function confirmarModelo() {
  if (!modelo.nome.trim()) {
    erroModelo.value = 'Informe o nome do cardápio.'
    return
  }
  if (!modelo.agrupamentoCardapioId) {
    erroModelo.value = 'Escolha o agrupamento.'
    return
  }
  if (modelo.refeicoes.length === 0) {
    erroModelo.value = 'Marque ao menos uma refeição.'
    return
  }
  const id = await criarCardapioModelo({
    nome: modelo.nome,
    ano: modelo.ano,
    agrupamentoCardapioId: modelo.agrupamentoCardapioId,
    quantidadeSemanas: modelo.quantidadeSemanas,
    refeicoes: modelo.refeicoes,
    observacoesCozinha: modelo.observacoesCozinha,
    nutricionistasResponsaveisIds: modelo.nutricionistasResponsaveisIds,
  })
  if (!id) {
    erroModelo.value = 'Não foi possível criar o cardápio.'
    return
  }
  erroModelo.value = ''
  modeloAberto.value = false
  modo.value = 'MODELO'
  cardapioId.value = id
  semanaAtual.value = 1
}

function abrirMeta() {
  metaId.value = referencia.value?.id ?? null
  metaAberta.value = true
}

function nomeDia(diaSemana: number) {
  return ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'][diaSemana]
}

function classeStatus(status: StatusCardapio) {
  if (status === 'PRONTO' || status === 'ATIVO') return 'bg-moss text-leaf'
  if (status === 'EM_ANALISE_EMPRESA') return 'bg-honey-soft text-honey'
  if (status === 'EM_ALTERACAO') return 'bg-[#f6e4d8] text-clay'
  return 'bg-cream text-ink/70'
}

function itensDa(dia: DiaGrade, refeicao: RefeicaoId) {
  return dia.refeicoes.find((item) => item.refeicao === refeicao)?.itens ?? []
}

function nomeItem(item: ItemGrade) {
  if (item.origem === 'FICHA') return fichas.value.find((ficha) => ficha.id === item.fichaId)?.nome ?? 'Ficha'
  return alimentos.value.find((alimento) => alimento.id === item.alimentoId)?.nome ?? 'Alimento'
}

const ORDEM_SAFRA: Record<StatusSafra, number> = { SAFRA_PLENA: 0, MEDIA_PRODUCAO: 1, FORA_SAFRA: 2 }

function foraDoMes(dia: DiaGrade): boolean {
  if (atual.value?.tipo !== 'MENSAL' || !dia.data || !atual.value.mes || !atual.value.ano) return false
  return Number(dia.data.slice(5, 7)) !== atual.value.mes || Number(dia.data.slice(0, 4)) !== atual.value.ano
}

function mesDoDia(dia: DiaGrade): number {
  if (dia.data) return Number(dia.data.slice(5, 7))
  return atual.value?.mes ?? new Date().getMonth() + 1
}

function statusSafraAlimento(alimentoId: string | undefined, mes: number): StatusSafra | null {
  if (!alimentoId) return null
  const alimento = alimentos.value.find((item) => item.id === alimentoId)
  return alimento?.safraMensal.find((safra) => safra.mes === mes)?.status ?? null
}

function piorSafra(statuses: Array<StatusSafra | null>): StatusSafra | null {
  const validos = statuses.filter((status): status is StatusSafra => Boolean(status))
  if (validos.length === 0) return null
  return validos.reduce((pior, atual) => (ORDEM_SAFRA[atual] > ORDEM_SAFRA[pior] ? atual : pior))
}

function statusSafraItem(item: ItemGrade, mes: number): StatusSafra | null {
  const status = item.origem === 'ALIMENTO'
    ? statusSafraAlimento(item.alimentoId, mes)
    : piorSafra((fichas.value.find((atual) => atual.id === item.fichaId)?.ingredientes ?? []).map((ingrediente) => statusSafraAlimento(ingrediente.alimentoId, mes)))
  return status === 'SAFRA_PLENA' ? null : status
}

function classeSafra(status: StatusSafra) {
  if (status === 'FORA_SAFRA') return 'bg-clay/15 text-clay'
  return 'bg-honey-soft text-honey'
}

function siglaSafra(status: StatusSafra) {
  if (status === 'FORA_SAFRA') return 'Fora de safra'
  if (status === 'MEDIA_PRODUCAO') return 'Média produção'
  return ''
}

const exibirSafra = computed(() => atual.value?.tipo === 'MENSAL')

const avisosSafraAgrupados = computed(() => {
  if (!exibirSafra.value || !atual.value) return [] as { mes: number; grupos: { status: StatusSafra; itens: { nome: string; dias: number[] }[] }[] }[]
  const porMes = new Map<number, Map<StatusSafra, Map<string, Set<number>>>>()
  for (const dia of diasDaSemana.value) {
    if (dia.tipoDia !== 'LETIVO' || foraDoMes(dia)) continue
    const mes = mesDoDia(dia)
    for (const refeicao of dia.refeicoes) {
      for (const item of refeicao.itens) {
        const status = statusSafraItem(item, mes)
        if (!status || status === 'SAFRA_PLENA') continue
        const porStatus = porMes.get(mes) ?? new Map<StatusSafra, Map<string, Set<number>>>()
        const porItem = porStatus.get(status) ?? new Map<string, Set<number>>()
        const dias = porItem.get(nomeItem(item)) ?? new Set<number>()
        dias.add(dia.diaSemana)
        porItem.set(nomeItem(item), dias)
        porStatus.set(status, porItem)
        porMes.set(mes, porStatus)
      }
    }
  }
  return [...porMes.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([mes, porStatus]) => ({
      mes,
      grupos: [...porStatus.entries()]
        .sort((a, b) => ORDEM_SAFRA[a[0]] - ORDEM_SAFRA[b[0]])
        .map(([status, porItem]) => ({
          status,
          itens: [...porItem.entries()]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([nome, dias]) => ({ nome, dias: [...dias].sort((a, b) => a - b) })),
        })),
    }))
})

const avisoSafraDraft = computed(() => {
  if (!celula.value || !exibirSafra.value) return ''
  const dia = diasDaSemana.value.find((item) => item.diaSemana === celula.value?.diaSemana)
  const mes = dia ? mesDoDia(dia) : (atual.value?.mes ?? new Date().getMonth() + 1)
  const item: ItemGrade = draft.origem === 'FICHA'
    ? { id: 'draft', origem: 'FICHA', fichaId: draft.fichaId, operador: null }
    : { id: 'draft', origem: 'ALIMENTO', alimentoId: draft.alimentoId, operador: null }
  const status = statusSafraItem(item, mes)
  if (!status || status === 'SAFRA_PLENA') return ''
  return `Atenção: ${nomeItem(item)} está em ${rotuloSafra(status).toLowerCase()} em ${nomeMes(mes)}. Confirme a disponibilidade antes de incluir.`
})

function abrirItem(dia: DiaGrade, refeicao: RefeicaoId) {
  celula.value = { diaSemana: dia.diaSemana, refeicao }
  erroItem.value = ''
  draft.fichaId = fichas.value[0]?.id ?? draft.fichaId
  draft.alimentoId = alimentosHortifruti.value[0]?.id ?? draft.alimentoId
}

async function alterarTipoDia(diaSemana: number, tipoDia: DiaGrade['tipoDia']) {
  if (!atual.value) return
  await definirTipoDia(atual.value.id, semanaAtual.value, diaSemana, tipoDia)
}

async function removerItem(diaSemana: number, refeicao: RefeicaoId, itemId: string) {
  if (!atual.value) return
  await removerItemGrade(atual.value.id, semanaAtual.value, diaSemana, refeicao, itemId)
}

async function mudarStatus(status: StatusCardapio) {
  if (!atual.value) return
  await definirStatus(atual.value.id, status)
}

async function confirmarItem() {
  if (!atual.value || !celula.value) return
  erroItem.value = ''
  try {
    await adicionarItemGrade(atual.value.id, semanaAtual.value, celula.value.diaSemana, celula.value.refeicao, {
      origem: draft.origem,
      operador: draft.operador,
      fichaId: draft.origem === 'FICHA' ? draft.fichaId : undefined,
      alimentoId: draft.origem === 'ALIMENTO' ? draft.alimentoId : undefined,
      perCapitaLiquido: draft.origem === 'ALIMENTO' ? draft.perCapitaLiquido : undefined,
      porcaoServidaGramas: draft.origem === 'FICHA' ? draft.porcaoServidaGramas : undefined,
    })
    celula.value = null
  } catch (erro) {
    const dados = (erro as { data?: { message?: unknown } })?.data
    erroItem.value = typeof dados?.message === 'string' ? dados.message : 'Não foi possível incluir o item.'
  }
}

async function clonar() {
  if (!modeloParaClonar.value) return
  const id = await clonarModelo(modeloParaClonar.value.id, mesSel.value, anoSel.value)
  clonagemAberta.value = false
  if (!id) return
  modo.value = 'MENSAL'
  cardapioId.value = id
}
</script>

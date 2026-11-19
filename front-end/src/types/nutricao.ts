export const CATEGORIAS_ALIMENTO = [
  'FRUTA',
  'LEGUME',
  'VERDURA',
  'CEREAL_GRAO',
  'PROTEINA',
  'LATICINIO',
  'OUTROS',
] as const

export const UNIDADES_MEDIDA = ['KG', 'DUZIA', 'MACO', 'UNIDADE', 'LITRO', 'GRAMA'] as const

export const STATUS_SAFRA = ['SAFRA_PLENA', 'MEDIA_PRODUCAO', 'FORA_SAFRA'] as const

export const NIVEIS_RESTRICAO = ['PERMITIDO', 'OFERTA_LIMITADA', 'PROIBIDO'] as const

export const ORIGENS_REGRA = ['LEI_PNAE', 'CONTRATO_TERCEIRIZADA'] as const

export const CATEGORIAS_VISUAL_GRUPO = [
  'PROTEINA',
  'AMIDO',
  'BEBIDAS',
  'CEREAIS',
  'ACOMPANHAMENTO',
  'PREPARACOES',
  'OUTROS',
] as const

export const TIPOS_ALVO_INCIDENCIA = ['GRUPO', 'FICHA_TECNICA', 'ALIMENTO'] as const

export const TIPOS_EVENTO_ITEM = [
  'REAJUSTE_PRECO',
  'INCLUSAO_ALIMENTO',
  'ACRESCIMO_QUANTIDADE',
  'INATIVACAO_ALIMENTO',
] as const

export const STATUS_CARDAPIO = [
  'ATIVO',
  'INATIVO',
  'NOVO',
  'EM_ALTERACAO',
  'EM_ANALISE_EMPRESA',
  'PRONTO',
] as const

export const TIPOS_DIA = ['LETIVO', 'FERIADO', 'REUNIAO_PEDAGOGICA', 'RECESSO'] as const

export const OPERADORES_ITEM = ['E', 'OU'] as const

export const REFEICOES = [
  { id: 'LANCHE_MANHA_1', nome: 'Lanche da manhã 1' },
  { id: 'LANCHE_MANHA_2', nome: 'Lanche da manhã 2' },
  { id: 'ALMOCO', nome: 'Almoço' },
  { id: 'LANCHE_TARDE', nome: 'Lanche da tarde' },
  { id: 'JANTAR', nome: 'Jantar' },
  { id: 'CEIA', nome: 'Ceia' },
] as const

export const DIAS_SEMANA = [
  { valor: 1, nome: 'Segunda', curto: 'Seg' },
  { valor: 2, nome: 'Terça', curto: 'Ter' },
  { valor: 3, nome: 'Quarta', curto: 'Qua' },
  { valor: 4, nome: 'Quinta', curto: 'Qui' },
  { valor: 5, nome: 'Sexta', curto: 'Sex' },
] as const

export const MESES = [
  { valor: 1, curto: 'Jan', nome: 'Janeiro' },
  { valor: 2, curto: 'Fev', nome: 'Fevereiro' },
  { valor: 3, curto: 'Mar', nome: 'Março' },
  { valor: 4, curto: 'Abr', nome: 'Abril' },
  { valor: 5, curto: 'Mai', nome: 'Maio' },
  { valor: 6, curto: 'Jun', nome: 'Junho' },
  { valor: 7, curto: 'Jul', nome: 'Julho' },
  { valor: 8, curto: 'Ago', nome: 'Agosto' },
  { valor: 9, curto: 'Set', nome: 'Setembro' },
  { valor: 10, curto: 'Out', nome: 'Outubro' },
  { valor: 11, curto: 'Nov', nome: 'Novembro' },
  { valor: 12, curto: 'Dez', nome: 'Dezembro' },
] as const

export const NUTRIENTES = [
  { chave: 'kcal', rotulo: 'Energia', unidade: 'kcal' },
  { chave: 'proteina', rotulo: 'Proteína', unidade: 'g' },
  { chave: 'lipidios', rotulo: 'Lipídios', unidade: 'g' },
  { chave: 'carboidratos', rotulo: 'Carboidratos', unidade: 'g' },
  { chave: 'fibraAlimentar', rotulo: 'Fibra alimentar', unidade: 'g' },
  { chave: 'calcio', rotulo: 'Cálcio', unidade: 'mg' },
  { chave: 'ferro', rotulo: 'Ferro', unidade: 'mg' },
  { chave: 'retinol', rotulo: 'Retinol', unidade: 'mcg' },
  { chave: 'vitaminaC', rotulo: 'Vitamina C', unidade: 'mg' },
  { chave: 'sodio', rotulo: 'Sódio', unidade: 'mg' },
  { chave: 'zinco', rotulo: 'Zinco', unidade: 'mg' },
  { chave: 'magnesio', rotulo: 'Magnésio', unidade: 'mg' },
] as const

export type CategoriaAlimento = (typeof CATEGORIAS_ALIMENTO)[number]
export type UnidadeMedida = (typeof UNIDADES_MEDIDA)[number]
export type StatusSafra = (typeof STATUS_SAFRA)[number]
export type NivelRestricao = (typeof NIVEIS_RESTRICAO)[number]
export type OrigemRegra = (typeof ORIGENS_REGRA)[number]
export type TipoEventoItem = (typeof TIPOS_EVENTO_ITEM)[number]
export type StatusCardapio = (typeof STATUS_CARDAPIO)[number]
export type TipoDia = (typeof TIPOS_DIA)[number]
export type OperadorItem = (typeof OPERADORES_ITEM)[number]
export type RefeicaoId = (typeof REFEICOES)[number]['id']
export type NutrienteChave = (typeof NUTRIENTES)[number]['chave']

export interface ComposicaoNutricional {
  kcal: number
  proteina: number
  lipidios: number
  carboidratos: number
  fibraAlimentar: number
  calcio: number
  ferro: number
  retinol: number
  vitaminaC: number
  sodio: number
  zinco: number
  magnesio: number
}

export interface SafraMes {
  mes: number
  status: StatusSafra
}

export interface RestricaoEtapa {
  erudioEtapaId: number
  nivel: NivelRestricao
  observacao?: string
}

export type CategoriaVisualGrupo = (typeof CATEGORIAS_VISUAL_GRUPO)[number]

export type TipoAlvoIncidencia = (typeof TIPOS_ALVO_INCIDENCIA)[number]

export type StatusIncidencia = 'OK' | 'EXCESSO' | 'INSUFICIENTE' | 'PROIBIDO'

export interface GrupoIncidencia {
  id: string
  nome: string
  categoriaVisual: CategoriaVisualGrupo
  origemRegra: OrigemRegra
  ativo: boolean
}

export interface IncidenciaRegra {
  id: string
  contratoTerceirizadaId: string | null
  tipoAlvo: TipoAlvoIncidencia
  grupoIncidenciaId: string | null
  fichaTecnicaId: string | null
  alimentoId: string | null
  agrupamentoCardapioId: string
  periodo: 'SEMANAL' | 'MENSAL'
  frequenciaMinima: number | null
  frequenciaMaxima: number | null
  ativo: boolean
}

export interface EtapaEnsino {
  erudioEtapaId: number
  nome: string
}

export interface Alimento {
  id: string
  nome: string
  categoria: CategoriaAlimento
  unidadeMedidaPadrao: UnidadeMedida
  gruposIncidenciaIds: string[]
  composicaoNutricional: ComposicaoNutricional
  safraMensal: SafraMes[]
  restricoesEtapaFnde: RestricaoEtapa[]
  ativo: boolean
}

export interface ItemHortifruti {
  alimentoId: string
  unidadeMedida: UnidadeMedida
  qtdTotalLicitada: number
  valorUnitario: number
  perCapita: number | null
  fatorCorrecao: number | null
  diasSemanaEntrega: number[]
  ativo: boolean
}

export interface ContratoHorti {
  id: string
  numeroContrato: string
  fornecedorNome: string
  fornecedorCnpj: string
  agriculturaFamiliar: boolean
  vigenciaInicio: string
  vigenciaFim: string
  arredondamentoTotalAlimentos: boolean
  itens: ItemHortifruti[]
  ativo: boolean
}

export interface EventoContrato {
  id: string
  contratoHortiId: string
  tipoEvento: TipoEventoItem
  numeroDocumento: string
  dataVigencia: string
  alimentoId: string
  unidadeMedida?: UnidadeMedida
  valorAnterior?: number
  valorNovo?: number
  qtdAnterior?: number
  qtdNova?: number
  motivo: string
  autorUsuarioId: string
  createdAt: string
}

export interface PrevisaoMensal {
  mes: number
  ano: number
  qtdPrevista: number
}

export interface ItemEmpenho {
  alimentoId: string
  qtdEmpenhada: number
  /** Protótipo da lista de compras. No back-end o consumo não fica gravado no empenho. */
  qtdConsumida: number
  unidadeMedida: UnidadeMedida
  valorUnitario: number
  previsaoMensal: PrevisaoMensal[]
}

export interface Empenho {
  id: string
  contratoHortiId: string
  numeroEmpenho: string
  fonteRecurso: string
  dataInicio: string
  dataFim: string
  itensEmpenhados: ItemEmpenho[]
  ativo: boolean
}

export interface IngredienteFicha {
  id: string
  alimentoId: string
  perCapitaBruto: number
  perCapitaLiquido: number
  fatorCorrecao?: number
}

export interface NutrientesFicha {
  energiaKcal: number
  energiaKj: number
  proteinasG: number
  lipidiosG: number
  carboidratosG: number
  calcioMg: number
  ferroMg: number
  retinolMcg: number
  vitaminaCMg: number
  sodioMg: number
  fibrasG: number
}

export interface PorcaoEtapa {
  erudioEtapaId: number
  quantidadeGramas: number
}

export interface FichaTecnica {
  id: string
  nome: string
  modoPreparo: string
  rendimentoTotalGramas: number
  fatorCoccao: number
  totalLiquidoGramas?: number
  totalBrutoGramas?: number
  nutrientesTotaisReceita?: NutrientesFicha
  nutrientesPor100gPronto?: NutrientesFicha
  gruposIncidenciaIds: string[]
  ingredientes: IngredienteFicha[]
  porcoesEtapa: PorcaoEtapa[]
}

export interface ItemGrade {
  id: string
  origem: 'FICHA' | 'ALIMENTO'
  fichaId?: string
  alimentoId?: string
  operador: OperadorItem | null
  perCapitaLiquido?: number
  perCapitaBruto?: number
  porcaoServidaGramas?: number
  ativoParaCompra?: boolean
  empenhoId?: string
  empenhosIngredientes?: Array<{ alimentoId: string; empenhoId: string }>
}

export interface RefeicaoGrade {
  refeicao: RefeicaoId
  itens: ItemGrade[]
}

export interface DiaGrade {
  numeroSemana: 1 | 2 | 3 | 4 | 5
  diaSemana: 1 | 2 | 3 | 4 | 5
  tipoDia: TipoDia
  data?: string
  refeicoes: RefeicaoGrade[]
}

export interface AgrupamentoCardapio {
  id: string
  nome: string
  /** Sigla usada na planilha de revisão (B1, EF, CEDIN LAN…). */
  sigla: string
  erudioEtapaIds: number[]
  ativo: boolean
}

export interface Cardapio {
  id: string
  nome: string
  tipo: 'MODELO' | 'MENSAL'
  status: StatusCardapio
  /** Primeira etapa do agrupamento. A lista de compras ainda lê por etapa. */
  erudioEtapaId: number
  agrupamentoCardapioId?: string
  refeicoes?: RefeicaoId[]
  observacoesCozinha?: string
  nutricionistasResponsaveisIds?: number[]
  mes?: number
  ano?: number
  dias: DiaGrade[]
}

export type FaixaChave =
  | 'kcal'
  | 'proteina'
  | 'lipidios'
  | 'carboidratos'
  | 'calcio'
  | 'ferro'
  | 'vitaminaA'
  | 'vitaminaC'
  | 'sodio'

export type LimitesPnae = {
  [Chave in FaixaChave as `${Chave}Min` | `${Chave}Max`]: number
}

export interface FaixaPnae extends LimitesPnae {
  id: string
  agrupamentoCardapioId: string
  descricaoFaixa: string
  ativo: boolean
}

export interface TipoRefeicao {
  id: string
  nome: string
  ordem: number
  ativo: boolean
}

export interface RegraRefeicaoTurno {
  id: string
  erudioEtapaId: number
  erudioTurnoId: number
  refeicaoId: string
  erudioUnidadeEnsinoId?: number | null
  ativo: boolean
}

// ---------- Alimentação especial (perfis de adaptação) ----------

export interface TipoRestricao {
  id: string
  nome: string
  ativo: boolean
}

export interface RestricaoAtiva {
  restricaoId: string
  nome: string
  alunosAtivos: number
}

export interface RestricoesAtivasResult {
  restricoes: RestricaoAtiva[]
  alunosComMultiplasRestricoes: number
}

export interface ItemOverride {
  operador?: 'E' | 'OU' | null
  ativoParaCompra?: boolean
  fichaTecnicaId?: string
  alimentoId?: string
  perCapitaBruto?: number
  porcaoServidaGramas?: number
}

export interface AdaptacaoOverride {
  data: string
  refeicao: string
  itens: ItemOverride[]
}

export interface AdaptacaoPerfil {
  id: string
  cardapioId: string
  cardapioNome?: string
  erudioEtapaId?: number
  nome: string
  prioridade: number
  restricoesIds: string[]
  ativo: boolean
  overrides: AdaptacaoOverride[]
}

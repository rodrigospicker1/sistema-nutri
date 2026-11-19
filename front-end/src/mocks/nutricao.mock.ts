import {
  DIAS_SEMANA,
  MESES,
  NUTRIENTES,
  REFEICOES,
  type AgrupamentoCardapio,
  type Alimento,
  type Cardapio,
  type ComposicaoNutricional,
  type ContratoHorti,
  type DiaGrade,
  type Empenho,
  type EtapaEnsino,
  type EventoContrato,
  type FaixaChave,
  type FaixaPnae,
  type FichaTecnica,
  type GrupoIncidencia,
  type IncidenciaRegra,
  type ItemGrade,
  type RefeicaoId,
  type StatusSafra,
} from '../types/nutricao'

export const META_AGRICULTURA_FAMILIAR = 0.45

/** IDs deste protótipo de ficha não são do Erudio. Catálogo oficial: `src/mocks/erudio.mock.ts`. */
export const etapas: EtapaEnsino[] = [
  { erudioEtapaId: 101, nome: 'Berçário 1' },
  { erudioEtapaId: 102, nome: 'Berçário 2' },
  { erudioEtapaId: 201, nome: 'Maternal I' },
  { erudioEtapaId: 301, nome: 'Pré-escola' },
]

export const gruposIncidencia: GrupoIncidencia[] = [
  { id: 'grp-frutas', nome: 'Frutas in natura', categoriaVisual: 'ACOMPANHAMENTO', origemRegra: 'LEI_PNAE', ativo: true },
  { id: 'grp-hortalicas', nome: 'Hortaliças', categoriaVisual: 'ACOMPANHAMENTO', origemRegra: 'LEI_PNAE', ativo: true },
  { id: 'grp-leguminosas', nome: 'Leguminosas', categoriaVisual: 'PROTEINA', origemRegra: 'LEI_PNAE', ativo: true },
  { id: 'grp-integrais', nome: 'Massas integrais', categoriaVisual: 'AMIDO', origemRegra: 'LEI_PNAE', ativo: true },
  { id: 'grp-paes', nome: 'Pães', categoriaVisual: 'CEREAIS', origemRegra: 'LEI_PNAE', ativo: true },
  { id: 'grp-chas', nome: 'Chás', categoriaVisual: 'BEBIDAS', origemRegra: 'LEI_PNAE', ativo: true },
  { id: 'grp-ultraprocessados', nome: 'Ultraprocessados', categoriaVisual: 'PREPARACOES', origemRegra: 'LEI_PNAE', ativo: true },
  { id: 'grp-doces', nome: 'Doces e Preparações com Açúcar', categoriaVisual: 'PREPARACOES', origemRegra: 'LEI_PNAE', ativo: true },
  { id: 'grp-embutidos', nome: 'Embutidos', categoriaVisual: 'PROTEINA', origemRegra: 'LEI_PNAE', ativo: true },
  { id: 'grp-carne-bovina', nome: 'Carne Bovina', categoriaVisual: 'PROTEINA', origemRegra: 'LEI_PNAE', ativo: true },
  { id: 'grp-cooperar', nome: 'Itens do contrato Cooperar', categoriaVisual: 'OUTROS', origemRegra: 'CONTRATO_TERCEIRIZADA', ativo: true },
]

/** Identificador externo. O contrato da terceirizada não vive neste banco. */
export const CONTRATO_COOPERAR_ID = 'contrato-cooperar'

export const incidenciasRegras: IncidenciaRegra[] = [
  { id: 'reg-doces-bercario', contratoTerceirizadaId: null, tipoAlvo: 'GRUPO', grupoIncidenciaId: 'grp-doces', fichaTecnicaId: null, alimentoId: null, agrupamentoCardapioId: 'agr-bercario-1', periodo: 'SEMANAL', frequenciaMinima: null, frequenciaMaxima: 0, ativo: true },
  { id: 'reg-doces-fundamental', contratoTerceirizadaId: null, tipoAlvo: 'GRUPO', grupoIncidenciaId: 'grp-doces', fichaTecnicaId: null, alimentoId: null, agrupamentoCardapioId: 'agr-fundamental', periodo: 'SEMANAL', frequenciaMinima: null, frequenciaMaxima: 2, ativo: true },
  { id: 'reg-embutidos-bercario', contratoTerceirizadaId: null, tipoAlvo: 'GRUPO', grupoIncidenciaId: 'grp-embutidos', fichaTecnicaId: null, alimentoId: null, agrupamentoCardapioId: 'agr-bercario-1', periodo: 'SEMANAL', frequenciaMinima: null, frequenciaMaxima: 0, ativo: true },
  { id: 'reg-embutidos-fundamental', contratoTerceirizadaId: null, tipoAlvo: 'GRUPO', grupoIncidenciaId: 'grp-embutidos', fichaTecnicaId: null, alimentoId: null, agrupamentoCardapioId: 'agr-fundamental', periodo: 'MENSAL', frequenciaMinima: null, frequenciaMaxima: 1, ativo: true },
  { id: 'reg-salsicha-bercario', contratoTerceirizadaId: null, tipoAlvo: 'ALIMENTO', grupoIncidenciaId: null, fichaTecnicaId: null, alimentoId: 'ali-salsicha', agrupamentoCardapioId: 'agr-bercario-1', periodo: 'SEMANAL', frequenciaMinima: null, frequenciaMaxima: 0, ativo: true },
  { id: 'reg-frutas-bercario', contratoTerceirizadaId: null, tipoAlvo: 'GRUPO', grupoIncidenciaId: 'grp-frutas', fichaTecnicaId: null, alimentoId: null, agrupamentoCardapioId: 'agr-bercario-1', periodo: 'SEMANAL', frequenciaMinima: 3, frequenciaMaxima: null, ativo: true },
  { id: 'reg-frutas-fundamental', contratoTerceirizadaId: null, tipoAlvo: 'GRUPO', grupoIncidenciaId: 'grp-frutas', fichaTecnicaId: null, alimentoId: null, agrupamentoCardapioId: 'agr-fundamental', periodo: 'SEMANAL', frequenciaMinima: 3, frequenciaMaxima: null, ativo: true },
  { id: 'reg-macarrao-ef', contratoTerceirizadaId: null, tipoAlvo: 'FICHA_TECNICA', grupoIncidenciaId: null, fichaTecnicaId: 'ft-macarrao', alimentoId: null, agrupamentoCardapioId: 'agr-fundamental', periodo: 'SEMANAL', frequenciaMinima: null, frequenciaMaxima: 2, ativo: true },
  { id: 'reg-leguminosas-ef', contratoTerceirizadaId: null, tipoAlvo: 'GRUPO', grupoIncidenciaId: 'grp-leguminosas', fichaTecnicaId: null, alimentoId: null, agrupamentoCardapioId: 'agr-fundamental', periodo: 'SEMANAL', frequenciaMinima: 1, frequenciaMaxima: 2, ativo: true },
  { id: 'reg-cooperar-fundamental', contratoTerceirizadaId: CONTRATO_COOPERAR_ID, tipoAlvo: 'GRUPO', grupoIncidenciaId: 'grp-cooperar', fichaTecnicaId: null, alimentoId: null, agrupamentoCardapioId: 'agr-fundamental', periodo: 'SEMANAL', frequenciaMinima: null, frequenciaMaxima: 2, ativo: true },
]

const zero = (): ComposicaoNutricional => ({
  kcal: 0,
  proteina: 0,
  lipidios: 0,
  carboidratos: 0,
  fibraAlimentar: 0,
  calcio: 0,
  ferro: 0,
  retinol: 0,
  vitaminaC: 0,
  sodio: 0,
  zinco: 0,
  magnesio: 0,
})

function safra(mapa: StatusSafra[]): { mes: number; status: StatusSafra }[] {
  return mapa.map((status, indice) => ({ mes: indice + 1, status }))
}

const plena = (): StatusSafra[] => Array.from({ length: 12 }, () => 'SAFRA_PLENA' as const)
const fora = (): StatusSafra[] => Array.from({ length: 12 }, () => 'FORA_SAFRA' as const)

export const alimentos: Alimento[] = [
  {
    id: 'ali-laranja-pera',
    nome: 'Laranja Pera',
    categoria: 'FRUTA',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-frutas'],
    composicaoNutricional: { ...zero(), kcal: 46, proteina: 1.1, lipidios: 0.2, carboidratos: 11.5, fibraAlimentar: 1, calcio: 22, ferro: 0.1, vitaminaC: 53, sodio: 1, zinco: 0.1, magnesio: 9 },
    safraMensal: safra(['FORA_SAFRA', 'FORA_SAFRA', 'FORA_SAFRA', 'MEDIA_PRODUCAO', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'MEDIA_PRODUCAO', 'FORA_SAFRA', 'FORA_SAFRA']),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO', observacao: 'Ofertar como suco coado, sem açúcar.' }],
    ativo: true,
  },
  {
    id: 'ali-banana-prata',
    nome: 'Banana Prata',
    categoria: 'FRUTA',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-frutas'],
    composicaoNutricional: { ...zero(), kcal: 98, proteina: 1.3, lipidios: 0.1, carboidratos: 26, fibraAlimentar: 2, calcio: 8, ferro: 0.3, retinol: 4, vitaminaC: 21.6, zinco: 0.2, magnesio: 26 },
    safraMensal: safra(plena()),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO', observacao: 'Amassar para o Berçário 1.' }],
    ativo: true,
  },
  {
    id: 'ali-mamao-formosa',
    nome: 'Mamão Formosa',
    categoria: 'FRUTA',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-frutas'],
    composicaoNutricional: { ...zero(), kcal: 45, proteina: 0.8, lipidios: 0.1, carboidratos: 11.6, fibraAlimentar: 1.8, calcio: 25, ferro: 0.2, vitaminaC: 78, sodio: 2, zinco: 0.1, magnesio: 10 },
    safraMensal: safra(['MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'MEDIA_PRODUCAO']),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO' }],
    ativo: true,
  },
  {
    id: 'ali-batata-doce-roxa',
    nome: 'Batata Doce Roxa',
    categoria: 'LEGUME',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-hortalicas'],
    composicaoNutricional: { ...zero(), kcal: 118, proteina: 1.3, lipidios: 0.1, carboidratos: 28.2, fibraAlimentar: 2.6, calcio: 21, ferro: 0.4, vitaminaC: 16.5, sodio: 17, zinco: 0.2, magnesio: 22 },
    safraMensal: safra(['MEDIA_PRODUCAO', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'MEDIA_PRODUCAO']),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO', observacao: 'Purê sem sal e sem açúcar.' }],
    ativo: true,
  },
  {
    id: 'ali-cenoura',
    nome: 'Cenoura',
    categoria: 'LEGUME',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-hortalicas'],
    composicaoNutricional: { ...zero(), kcal: 34, proteina: 1.3, lipidios: 0.2, carboidratos: 7.7, fibraAlimentar: 3.2, calcio: 23, ferro: 0.2, vitaminaC: 5, sodio: 3, zinco: 0.2, magnesio: 12 },
    safraMensal: safra(['SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'FORA_SAFRA', 'FORA_SAFRA', 'MEDIA_PRODUCAO', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA']),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO' }],
    ativo: true,
  },
  {
    id: 'ali-abobrinha',
    nome: 'Abobrinha Italiana',
    categoria: 'LEGUME',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-hortalicas'],
    composicaoNutricional: { ...zero(), kcal: 19, proteina: 1.2, lipidios: 0.1, carboidratos: 4, fibraAlimentar: 1.4, calcio: 19, ferro: 0.3, vitaminaC: 10, sodio: 1, zinco: 0.2, magnesio: 18 },
    safraMensal: safra(['MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'FORA_SAFRA', 'FORA_SAFRA', 'MEDIA_PRODUCAO']),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO' }],
    ativo: true,
  },
  {
    id: 'ali-tomate',
    nome: 'Tomate',
    categoria: 'LEGUME',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-hortalicas'],
    composicaoNutricional: { ...zero(), kcal: 15, proteina: 1.1, lipidios: 0.2, carboidratos: 3.1, fibraAlimentar: 1.2, calcio: 7, ferro: 0.2, vitaminaC: 21, sodio: 1, zinco: 0.1, magnesio: 11 },
    safraMensal: safra(['MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'FORA_SAFRA', 'FORA_SAFRA', 'MEDIA_PRODUCAO', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'MEDIA_PRODUCAO']),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'OFERTA_LIMITADA', observacao: 'Sem pele e sem semente no Berçário 1.' }],
    ativo: true,
  },
  {
    id: 'ali-couve',
    nome: 'Couve Manteiga',
    categoria: 'VERDURA',
    unidadeMedidaPadrao: 'MACO',
    gruposIncidenciaIds: ['grp-hortalicas'],
    composicaoNutricional: { ...zero(), kcal: 27, proteina: 2.9, lipidios: 0.5, carboidratos: 4.3, fibraAlimentar: 3, calcio: 131, ferro: 0.5, vitaminaC: 96, sodio: 6, zinco: 0.3, magnesio: 15 },
    safraMensal: safra(['MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'SAFRA_PLENA', 'MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'MEDIA_PRODUCAO', 'MEDIA_PRODUCAO']),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO', observacao: 'Picar fino e cozinhar bem.' }],
    ativo: true,
  },
  {
    id: 'ali-macarrao',
    nome: 'Macarrão Integral',
    categoria: 'CEREAL_GRAO',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-integrais', 'grp-cooperar'],
    composicaoNutricional: { ...zero(), kcal: 124, proteina: 5, lipidios: 1.2, carboidratos: 23.5, fibraAlimentar: 2.7, calcio: 8, ferro: 0.5, sodio: 1, zinco: 0.6, magnesio: 30 },
    safraMensal: safra(fora()),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO', observacao: 'Cozido além do ponto, em pedaços curtos.' }],
    ativo: true,
  },
  {
    id: 'ali-arroz',
    nome: 'Arroz Integral',
    categoria: 'CEREAL_GRAO',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-integrais', 'grp-cooperar'],
    composicaoNutricional: { ...zero(), kcal: 124, proteina: 2.6, lipidios: 1, carboidratos: 25.8, fibraAlimentar: 2.7, calcio: 5, ferro: 0.3, sodio: 1, zinco: 0.6, magnesio: 59 },
    safraMensal: safra(fora()),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'OFERTA_LIMITADA', observacao: 'Pode ser substituído por cereal mais macio nesta etapa.' }],
    ativo: true,
  },
  {
    id: 'ali-feijao',
    nome: 'Feijão Carioca',
    categoria: 'PROTEINA',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-cooperar', 'grp-leguminosas'],
    composicaoNutricional: { ...zero(), kcal: 76, proteina: 4.8, lipidios: 0.5, carboidratos: 13.6, fibraAlimentar: 8.5, calcio: 27, ferro: 1.3, sodio: 2, zinco: 0.7, magnesio: 40 },
    safraMensal: safra(fora()),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO', observacao: 'Caldo grosso, grãos amassados.' }],
    ativo: true,
  },
  {
    id: 'ali-frango',
    nome: 'Frango Desfiado',
    categoria: 'PROTEINA',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-cooperar'],
    composicaoNutricional: { ...zero(), kcal: 159, proteina: 32, lipidios: 2.5, calcio: 6, ferro: 0.4, sodio: 50, zinco: 0.8, magnesio: 28 },
    safraMensal: safra(fora()),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO', observacao: 'Desfiado fino, sem tempero industrializado.' }],
    ativo: true,
  },
  {
    id: 'ali-ovo',
    nome: 'Ovo',
    categoria: 'PROTEINA',
    unidadeMedidaPadrao: 'DUZIA',
    gruposIncidenciaIds: ['grp-hortalicas'],
    composicaoNutricional: { ...zero(), kcal: 146, proteina: 13.3, lipidios: 9.5, carboidratos: 0.6, calcio: 49, ferro: 1.6, retinol: 140, sodio: 146, zinco: 1.1, magnesio: 10 },
    safraMensal: safra(plena()),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PERMITIDO', observacao: 'Cozido e amassado.' }],
    ativo: true,
  },
  {
    id: 'ali-leite',
    nome: 'Leite em pó integral',
    categoria: 'LATICINIO',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-cooperar'],
    composicaoNutricional: { ...zero(), kcal: 496, proteina: 25, lipidios: 27, carboidratos: 39, calcio: 890, ferro: 0.5, retinol: 240, vitaminaC: 5, sodio: 370, zinco: 3, magnesio: 80 },
    safraMensal: safra(fora()),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'OFERTA_LIMITADA', observacao: 'Diluição da ficha. Não substitui leite materno.' }],
    ativo: true,
  },
  {
    id: 'ali-oleo',
    nome: 'Óleo de soja',
    categoria: 'OUTROS',
    unidadeMedidaPadrao: 'LITRO',
    gruposIncidenciaIds: ['grp-cooperar'],
    composicaoNutricional: { ...zero(), kcal: 884, lipidios: 100 },
    safraMensal: safra(fora()),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'OFERTA_LIMITADA', observacao: 'Usar só o previsto na ficha técnica.' }],
    ativo: true,
  },
  {
    id: 'ali-acucar',
    nome: 'Açúcar',
    categoria: 'OUTROS',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-ultraprocessados', 'grp-doces'],
    composicaoNutricional: { ...zero(), kcal: 387, carboidratos: 99.6 },
    safraMensal: safra(fora()),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PROIBIDO', observacao: 'Proibido para menores de 2 anos.' }],
    ativo: true,
  },
  {
    id: 'ali-salsicha',
    nome: 'Salsicha',
    categoria: 'PROTEINA',
    unidadeMedidaPadrao: 'KG',
    gruposIncidenciaIds: ['grp-embutidos'],
    composicaoNutricional: { ...zero(), kcal: 230, proteina: 12, lipidios: 18, carboidratos: 3, sodio: 900 },
    safraMensal: safra(plena()),
    restricoesEtapaFnde: [{ erudioEtapaId: 101, nivel: 'PROIBIDO', observacao: 'Embutido proibido no berçário.' }],
    ativo: true,
  },
]

/** Prestação de serviço registrada em outro banco. Entra só na conta da meta de 45%. */
export const VALOR_PRESTACAO_SERVICO_EXTERNA = 26000

export const contratosHorti: ContratoHorti[] = [
  {
    id: 'ct-kmj',
    numeroContrato: '045/2026',
    fornecedorNome: 'KMJ Hortifruti',
    fornecedorCnpj: '18442233000190',
    agriculturaFamiliar: true,
    vigenciaInicio: '2026-02-01',
    vigenciaFim: '2027-01-31',
    arredondamentoTotalAlimentos: true,
    ativo: true,
    itens: [
      { alimentoId: 'ali-batata-doce-roxa', unidadeMedida: 'KG', qtdTotalLicitada: 800, valorUnitario: 4.8, perCapita: 80, fatorCorrecao: 1.25, diasSemanaEntrega: [1, 3, 5], ativo: true },
      { alimentoId: 'ali-laranja-pera', unidadeMedida: 'KG', qtdTotalLicitada: 1200, valorUnitario: 3.4, perCapita: 80, fatorCorrecao: 1.88, diasSemanaEntrega: [1, 3, 5], ativo: true },
      { alimentoId: 'ali-banana-prata', unidadeMedida: 'KG', qtdTotalLicitada: 900, valorUnitario: 3.9, perCapita: 40, fatorCorrecao: 1.4, diasSemanaEntrega: [1, 4], ativo: true },
      { alimentoId: 'ali-couve', unidadeMedida: 'MACO', qtdTotalLicitada: 300, valorUnitario: 3.2, perCapita: 10, fatorCorrecao: 1.3, diasSemanaEntrega: [2, 5], ativo: true },
      { alimentoId: 'ali-cenoura', unidadeMedida: 'KG', qtdTotalLicitada: 600, valorUnitario: 2.9, perCapita: 15, fatorCorrecao: 1.2, diasSemanaEntrega: [1, 3, 5], ativo: true },
      { alimentoId: 'ali-mamao-formosa', unidadeMedida: 'KG', qtdTotalLicitada: 400, valorUnitario: 4.5, perCapita: 40, fatorCorrecao: 1.35, diasSemanaEntrega: [2, 4], ativo: true },
    ],
  },
  {
    id: 'ct-coopafren',
    numeroContrato: '046/2026',
    fornecedorNome: 'CoopaFren',
    fornecedorCnpj: '09221145000162',
    agriculturaFamiliar: true,
    vigenciaInicio: '2026-02-01',
    vigenciaFim: '2026-12-20',
    arredondamentoTotalAlimentos: false,
    ativo: true,
    itens: [
      { alimentoId: 'ali-abobrinha', unidadeMedida: 'KG', qtdTotalLicitada: 500, valorUnitario: 3.6, perCapita: 30, fatorCorrecao: 1.15, diasSemanaEntrega: [2, 5], ativo: true },
      { alimentoId: 'ali-tomate', unidadeMedida: 'KG', qtdTotalLicitada: 450, valorUnitario: 5.2, perCapita: 20, fatorCorrecao: 1.1, diasSemanaEntrega: [1, 4], ativo: true },
      { alimentoId: 'ali-ovo', unidadeMedida: 'DUZIA', qtdTotalLicitada: 200, valorUnitario: 14, perCapita: 25, fatorCorrecao: 1.12, diasSemanaEntrega: [1, 3], ativo: true },
    ],
  },
]

export const eventosContrato: EventoContrato[] = [
  {
    id: 'ev-1',
    contratoHortiId: 'ct-kmj',
    tipoEvento: 'REAJUSTE_PRECO',
    numeroDocumento: 'Aditivo 02/2026',
    dataVigencia: '2026-05-01',
    alimentoId: 'ali-laranja-pera',
    unidadeMedida: 'KG',
    valorAnterior: 3.1,
    valorNovo: 3.4,
    motivo: 'Reajuste de entressafra da laranja pera.',
    autorUsuarioId: 'nutri.ana',
    createdAt: '2026-04-28T14:10:00.000Z',
  },
  {
    id: 'ev-2',
    contratoHortiId: 'ct-kmj',
    tipoEvento: 'ACRESCIMO_QUANTIDADE',
    numeroDocumento: 'Aditivo 03/2026',
    dataVigencia: '2026-06-01',
    alimentoId: 'ali-batata-doce-roxa',
    unidadeMedida: 'KG',
    qtdAnterior: 600,
    qtdNova: 800,
    motivo: 'Aumento da oferta de purê no Berçário 1.',
    autorUsuarioId: 'nutri.ana',
    createdAt: '2026-05-20T11:00:00.000Z',
  },
  {
    id: 'ev-3',
    contratoHortiId: 'ct-kmj',
    tipoEvento: 'INCLUSAO_ALIMENTO',
    numeroDocumento: 'Aditivo 04/2026',
    dataVigencia: '2026-07-01',
    alimentoId: 'ali-mamao-formosa',
    unidadeMedida: 'KG',
    valorNovo: 4.5,
    qtdNova: 400,
    motivo: 'Inclusão de fruta de safra para o lanche da tarde.',
    autorUsuarioId: 'nutri.lia',
    createdAt: '2026-06-18T09:30:00.000Z',
  },
]

export const empenhos: Empenho[] = [
  {
    id: 'emp-421',
    contratoHortiId: 'ct-kmj',
    numeroEmpenho: '2026NE00421',
    fonteRecurso: 'PNAE — Agricultura familiar',
    dataInicio: '2026-03-01',
    dataFim: '2026-07-31',
    ativo: true,
    itensEmpenhados: [
      { alimentoId: 'ali-batata-doce-roxa', qtdEmpenhada: 500, qtdConsumida: 180, unidadeMedida: 'KG', valorUnitario: 4.8, previsaoMensal: [{ mes: 3, ano: 2026, qtdPrevista: 100 }, { mes: 4, ano: 2026, qtdPrevista: 100 }, { mes: 5, ano: 2026, qtdPrevista: 100 }, { mes: 6, ano: 2026, qtdPrevista: 100 }, { mes: 7, ano: 2026, qtdPrevista: 100 }] },
      { alimentoId: 'ali-laranja-pera', qtdEmpenhada: 700, qtdConsumida: 260, unidadeMedida: 'KG', valorUnitario: 3.4, previsaoMensal: [{ mes: 6, ano: 2026, qtdPrevista: 200 }, { mes: 7, ano: 2026, qtdPrevista: 200 }] },
      { alimentoId: 'ali-couve', qtdEmpenhada: 180, qtdConsumida: 70, unidadeMedida: 'MACO', valorUnitario: 3.2, previsaoMensal: [{ mes: 5, ano: 2026, qtdPrevista: 40 }] },
      { alimentoId: 'ali-cenoura', qtdEmpenhada: 250, qtdConsumida: 90, unidadeMedida: 'KG', valorUnitario: 2.9, previsaoMensal: [{ mes: 5, ano: 2026, qtdPrevista: 80 }] },
    ],
  },
  {
    id: 'emp-488',
    contratoHortiId: 'ct-kmj',
    numeroEmpenho: '2026NE00488',
    fonteRecurso: 'PNAE — Agricultura familiar',
    dataInicio: '2026-04-01',
    dataFim: '2026-08-31',
    ativo: true,
    itensEmpenhados: [
      { alimentoId: 'ali-banana-prata', qtdEmpenhada: 600, qtdConsumida: 210, unidadeMedida: 'KG', valorUnitario: 3.9, previsaoMensal: [{ mes: 4, ano: 2026, qtdPrevista: 150 }, { mes: 5, ano: 2026, qtdPrevista: 150 }] },
    ],
  },
  {
    id: 'emp-102',
    contratoHortiId: 'ct-coopafren',
    numeroEmpenho: '2026NE00102',
    fonteRecurso: 'PNAE — Agricultura familiar',
    dataInicio: '2026-03-01',
    dataFim: '2026-06-30',
    ativo: true,
    itensEmpenhados: [
      { alimentoId: 'ali-abobrinha', qtdEmpenhada: 180, qtdConsumida: 40, unidadeMedida: 'KG', valorUnitario: 3.6, previsaoMensal: [{ mes: 4, ano: 2026, qtdPrevista: 60 }] },
      { alimentoId: 'ali-ovo', qtdEmpenhada: 80, qtdConsumida: 16, unidadeMedida: 'DUZIA', valorUnitario: 14, previsaoMensal: [{ mes: 4, ano: 2026, qtdPrevista: 20 }] },
    ],
  },
  {
    id: 'emp-090',
    contratoHortiId: 'ct-kmj',
    numeroEmpenho: '2025NE00990',
    fonteRecurso: 'PNAE — Recurso federal',
    dataInicio: '2025-11-01',
    dataFim: '2026-01-31',
    ativo: false,
    itensEmpenhados: [
      { alimentoId: 'ali-banana-prata', qtdEmpenhada: 200, qtdConsumida: 200, unidadeMedida: 'KG', valorUnitario: 3.5, previsaoMensal: [] },
    ],
  },
]

export const fichasTecnicas: FichaTecnica[] = [
  {
    id: 'ft-suco-laranja',
    nome: 'Suco de laranja pera',
    modoPreparo: 'Lavar a laranja pera, cortar e extrair o suco na hora. Coar. Não adoçar. Servir em seguida, em temperatura ambiente para o Berçário 1.',
    rendimentoTotalGramas: 4000,
    fatorCoccao: 1,
    gruposIncidenciaIds: ['grp-frutas'],
    ingredientes: [
      { id: 'ing-1', alimentoId: 'ali-laranja-pera', perCapitaBruto: 150, perCapitaLiquido: 80 },
    ],
    porcoesEtapa: [
      { erudioEtapaId: 101, quantidadeGramas: 80 },
      { erudioEtapaId: 102, quantidadeGramas: 100 },
      { erudioEtapaId: 201, quantidadeGramas: 120 },
    ],
  },
  {
    id: 'ft-pure-batata',
    nome: 'Purê de batata doce roxa',
    modoPreparo: 'Lavar, descascar e cozinhar a batata doce roxa até desmanchar. Amassar ainda quente. Acrescentar o óleo de soja. Não usar sal nem açúcar. Servir morno.',
    rendimentoTotalGramas: 6400,
    fatorCoccao: 0.9,
    gruposIncidenciaIds: ['grp-hortalicas'],
    ingredientes: [
      { id: 'ing-2', alimentoId: 'ali-batata-doce-roxa', perCapitaBruto: 100, perCapitaLiquido: 80 },
      { id: 'ing-3', alimentoId: 'ali-oleo', perCapitaBruto: 2, perCapitaLiquido: 2 },
    ],
    porcoesEtapa: [
      { erudioEtapaId: 101, quantidadeGramas: 80 },
      { erudioEtapaId: 201, quantidadeGramas: 120 },
      { erudioEtapaId: 301, quantidadeGramas: 150 },
    ],
  },
  {
    id: 'ft-macarrao',
    nome: 'Macarrão integral com legumes',
    modoPreparo: 'Cozinhar o macarrão integral até ficar macio. Refogar couve e cenoura no óleo só o bastante para amaciar. Misturar ao macarrão sem caldo salgado.',
    rendimentoTotalGramas: 5200,
    fatorCoccao: 2.1,
    gruposIncidenciaIds: ['grp-integrais', 'grp-hortalicas'],
    ingredientes: [
      { id: 'ing-4', alimentoId: 'ali-macarrao', perCapitaBruto: 20, perCapitaLiquido: 40 },
      { id: 'ing-5', alimentoId: 'ali-couve', perCapitaBruto: 13, perCapitaLiquido: 10 },
      { id: 'ing-6', alimentoId: 'ali-cenoura', perCapitaBruto: 18, perCapitaLiquido: 15 },
    ],
    porcoesEtapa: [
      { erudioEtapaId: 101, quantidadeGramas: 65 },
      { erudioEtapaId: 201, quantidadeGramas: 100 },
      { erudioEtapaId: 301, quantidadeGramas: 130 },
    ],
  },
]

function gradeVazia(): DiaGrade[] {
  const dias: DiaGrade[] = []
  for (let semana = 1; semana <= 5; semana += 1) {
    for (const dia of DIAS_SEMANA) {
      dias.push({
        numeroSemana: semana as DiaGrade['numeroSemana'],
        diaSemana: dia.valor,
        tipoDia: 'LETIVO',
        refeicoes: REFEICOES.map((refeicao) => ({ refeicao: refeicao.id, itens: [] })),
      })
    }
  }
  return dias
}

function item(parcial: Omit<ItemGrade, 'id'> & { id: string }): ItemGrade {
  return parcial
}

const semanaBercario: Record<RefeicaoId, ItemGrade[]> = {
  LANCHE_MANHA_1: [item({ id: 'g-suco', origem: 'FICHA', fichaId: 'ft-suco-laranja', operador: null })],
  LANCHE_MANHA_2: [item({ id: 'g-banana', origem: 'ALIMENTO', alimentoId: 'ali-banana-prata', operador: null, perCapitaLiquido: 40 })],
  ALMOCO: [item({ id: 'g-pure', origem: 'FICHA', fichaId: 'ft-pure-batata', operador: null })],
  LANCHE_TARDE: [item({ id: 'g-mamao', origem: 'ALIMENTO', alimentoId: 'ali-mamao-formosa', operador: null, perCapitaLiquido: 40 })],
  JANTAR: [item({ id: 'g-macarrao', origem: 'FICHA', fichaId: 'ft-macarrao', operador: null })],
  CEIA: [item({ id: 'g-leite', origem: 'ALIMENTO', alimentoId: 'ali-leite', operador: null, perCapitaLiquido: 8 })],
}

function gradeBercario(): DiaGrade[] {
  const dias = gradeVazia()
  for (const dia of dias) {
    if (dia.numeroSemana === 2 && dia.diaSemana === 5) dia.tipoDia = 'FERIADO'
    if (dia.numeroSemana === 4 && dia.diaSemana === 3) dia.tipoDia = 'REUNIAO_PEDAGOGICA'
    if (dia.numeroSemana !== 1 || dia.tipoDia !== 'LETIVO') continue
    for (const refeicao of dia.refeicoes) {
      refeicao.itens = semanaBercario[refeicao.refeicao].map((entrada) => ({
        ...entrada,
        id: `${entrada.id}-s${dia.numeroSemana}-d${dia.diaSemana}`,
      }))
    }
  }
  return dias
}

export interface EscolaDemanda {
  erudioUnidadeEnsinoId: number
  erudioEtapaId: number
  nomeEscola: string
  alunosAtivos: number
}

export interface AlimentacaoEspecialMock {
  erudioMatriculaId: number
  erudioUnidadeEnsinoId: number
  erudioEtapaId: number
  status: 'DEFERIDO'
  alimentosNaoUtilizadosIds: string[]
  alimentosUtilizadosIds: string[]
}

export const demandasEscolares: EscolaDemanda[] = [
  { erudioUnidadeEnsinoId: 501, erudioEtapaId: 101, nomeEscola: 'CMEI Pequeno Príncipe', alunosAtivos: 8 },
  { erudioUnidadeEnsinoId: 502, erudioEtapaId: 101, nomeEscola: 'CMEI Maré Alta', alunosAtivos: 6 },
]

export interface MatriculaEscolarMock {
  erudioEnturmacaoId?: number
  erudioMatriculaId: number
  erudioAlunoId: number
  erudioUnidadeEnsinoId: number
  nomeEscola: string
  erudioEtapaId: number
  erudioTurnoId: number
  dataEfetivacao?: string
  dataEncerramento?: string | null
  situacao?: 'CURSANDO'
}

/**
 * Matrículas granulares para a regra de contraturno. Cobre turno único
 * (manhã/tarde/integral) e pares de unidades do mesmo `erudioAlunoId`
 * (alunos 7001–7008). Fonte completa: docs/mocks/matriculas-contraturno.mock.json
 */
export const matriculasEscolares: MatriculaEscolarMock[] = [
  // Turno único matutino
  { erudioMatriculaId: 1001, erudioAlunoId: 5000, erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', erudioEtapaId: 1, erudioTurnoId: 1 },
  { erudioMatriculaId: 1007, erudioAlunoId: 5006, erudioUnidadeEnsinoId: 16140, nomeEscola: 'ÂNGELA DALÇÓQUIO DE SOUZA', erudioEtapaId: 1, erudioTurnoId: 1 },
  // Turno único vespertino
  { erudioMatriculaId: 1017, erudioAlunoId: 5016, erudioUnidadeEnsinoId: 16140, nomeEscola: 'ÂNGELA DALÇÓQUIO DE SOUZA', erudioEtapaId: 21, erudioTurnoId: 2 },
  { erudioMatriculaId: 1025, erudioAlunoId: 5024, erudioUnidadeEnsinoId: 16158, nomeEscola: 'ANNINHA LINHARES DE MIRANDA', erudioEtapaId: 1, erudioTurnoId: 2 },
  // Turno único noturno / integral
  { erudioMatriculaId: 1031, erudioAlunoId: 5030, erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', erudioEtapaId: 1, erudioTurnoId: 3 },
  { erudioMatriculaId: 1043, erudioAlunoId: 6000, erudioUnidadeEnsinoId: 16163, nomeEscola: 'ANTÔNIO JOÃO VICENTE', erudioEtapaId: 1, erudioTurnoId: 4 },
  // Contraturno (2 unidades, turno manhã + tarde)
  { erudioMatriculaId: 1051, erudioAlunoId: 7001, erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', erudioEtapaId: 16, erudioTurnoId: 1 },
  { erudioMatriculaId: 1052, erudioAlunoId: 7001, erudioUnidadeEnsinoId: 16158, nomeEscola: 'ANNINHA LINHARES DE MIRANDA', erudioEtapaId: 20, erudioTurnoId: 2 },
  { erudioMatriculaId: 1053, erudioAlunoId: 7002, erudioUnidadeEnsinoId: 16140, nomeEscola: 'ÂNGELA DALÇÓQUIO DE SOUZA', erudioEtapaId: 2, erudioTurnoId: 1 },
  { erudioMatriculaId: 1054, erudioAlunoId: 7002, erudioUnidadeEnsinoId: 16166, nomeEscola: 'AUGUSTO BENTO DE OLIVEIRA', erudioEtapaId: 21, erudioTurnoId: 2 },
  { erudioMatriculaId: 1055, erudioAlunoId: 7003, erudioUnidadeEnsinoId: 16151, nomeEscola: 'ARNALDO BRANDÃO', erudioEtapaId: 1, erudioTurnoId: 1 },
  { erudioMatriculaId: 1056, erudioAlunoId: 7003, erudioUnidadeEnsinoId: 16163, nomeEscola: 'ANTÔNIO JOÃO VICENTE', erudioEtapaId: 23, erudioTurnoId: 2 },
  { erudioMatriculaId: 1057, erudioAlunoId: 7004, erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', erudioEtapaId: 20, erudioTurnoId: 1 },
  { erudioMatriculaId: 1058, erudioAlunoId: 7004, erudioUnidadeEnsinoId: 16158, nomeEscola: 'ANNINHA LINHARES DE MIRANDA', erudioEtapaId: 16, erudioTurnoId: 2 },
  { erudioMatriculaId: 1059, erudioAlunoId: 7005, erudioUnidadeEnsinoId: 16158, nomeEscola: 'ANNINHA LINHARES DE MIRANDA', erudioEtapaId: 21, erudioTurnoId: 1 },
  { erudioMatriculaId: 1060, erudioAlunoId: 7005, erudioUnidadeEnsinoId: 16140, nomeEscola: 'ÂNGELA DALÇÓQUIO DE SOUZA', erudioEtapaId: 1, erudioTurnoId: 2 },
  { erudioMatriculaId: 1061, erudioAlunoId: 7006, erudioUnidadeEnsinoId: 16163, nomeEscola: 'ANTÔNIO JOÃO VICENTE', erudioEtapaId: 23, erudioTurnoId: 1 },
  { erudioMatriculaId: 1062, erudioAlunoId: 7006, erudioUnidadeEnsinoId: 16151, nomeEscola: 'ARNALDO BRANDÃO', erudioEtapaId: 2, erudioTurnoId: 2 },
  { erudioMatriculaId: 1063, erudioAlunoId: 7007, erudioUnidadeEnsinoId: 16166, nomeEscola: 'AUGUSTO BENTO DE OLIVEIRA', erudioEtapaId: 16, erudioTurnoId: 1 },
  { erudioMatriculaId: 1064, erudioAlunoId: 7007, erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', erudioEtapaId: 20, erudioTurnoId: 2 },
  { erudioMatriculaId: 1065, erudioAlunoId: 7008, erudioUnidadeEnsinoId: 16158, nomeEscola: 'ANNINHA LINHARES DE MIRANDA', erudioEtapaId: 1, erudioTurnoId: 1 },
  { erudioMatriculaId: 1066, erudioAlunoId: 7008, erudioUnidadeEnsinoId: 16140, nomeEscola: 'ÂNGELA DALÇÓQUIO DE SOUZA', erudioEtapaId: 21, erudioTurnoId: 2 },
]

export interface ConfiguracaoAlmocoUnidadeMock {
  erudioUnidadeEnsinoId: number
  nomeEscola: string
  ofereceAlmocoContraturno: boolean
}

/**
 * A 16166 (Augusto Bento) NÃO oferece almoço de contraturno: alunos 7002 e
 * 7007 têm o almoço alocado na outra unidade do par. Demais unidades: true.
 */
export const configuracoesAlmocoContraturnoMock: ConfiguracaoAlmocoUnidadeMock[] = [
  { erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', ofereceAlmocoContraturno: true },
  { erudioUnidadeEnsinoId: 16140, nomeEscola: 'ÂNGELA DALÇÓQUIO DE SOUZA', ofereceAlmocoContraturno: true },
  { erudioUnidadeEnsinoId: 16151, nomeEscola: 'ARNALDO BRANDÃO', ofereceAlmocoContraturno: true },
  { erudioUnidadeEnsinoId: 16158, nomeEscola: 'ANNINHA LINHARES DE MIRANDA', ofereceAlmocoContraturno: true },
  { erudioUnidadeEnsinoId: 16163, nomeEscola: 'ANTÔNIO JOÃO VICENTE', ofereceAlmocoContraturno: true },
  { erudioUnidadeEnsinoId: 16166, nomeEscola: 'AUGUSTO BENTO DE OLIVEIRA', ofereceAlmocoContraturno: false },
]

export const alimentacoesEspeciais: AlimentacaoEspecialMock[] = [
  {
    erudioMatriculaId: 9001,
    erudioUnidadeEnsinoId: 501,
    erudioEtapaId: 101,
    status: 'DEFERIDO',
    alimentosNaoUtilizadosIds: ['ali-laranja-pera'],
    alimentosUtilizadosIds: ['ali-banana-prata'],
  },
]

function diaPronto(data: string, tipoDia: DiaGrade['tipoDia'], refeicoes: Partial<Record<RefeicaoId, ItemGrade[]>>): DiaGrade {
  const diaSemana = new Date(`${data}T12:00:00`).getDay() as DiaGrade['diaSemana']
  return {
    data,
    numeroSemana: 1,
    diaSemana,
    tipoDia,
    refeicoes: REFEICOES.map((refeicao) => ({ refeicao: refeicao.id, itens: refeicoes[refeicao.id] ?? [] })),
  }
}

export const cardapiosParaCompra: Cardapio[] = [{
  id: 'card-pronto-b1',
  nome: 'Berçário 1 — Novembro/2026 pronto',
  tipo: 'MENSAL',
  status: 'PRONTO',
  erudioEtapaId: 101,
  mes: 11,
  ano: 2026,
  dias: [
    diaPronto('2026-11-02', 'LETIVO', {
      LANCHE_MANHA_1: [
        item({
          id: 'pronto-suco',
          origem: 'FICHA',
          fichaId: 'ft-suco-laranja',
          operador: null,
          ativoParaCompra: true,
          empenhosIngredientes: [{ alimentoId: 'ali-laranja-pera', empenhoId: 'emp-421' }],
        }),
        item({
          id: 'pronto-banana-ou',
          origem: 'ALIMENTO',
          alimentoId: 'ali-banana-prata',
          operador: 'OU',
          ativoParaCompra: false,
          perCapitaBruto: 40,
          empenhoId: 'emp-488',
        }),
      ],
    }),
    diaPronto('2026-11-03', 'LETIVO', {
      ALMOCO: [
        item({
          id: 'pronto-pure',
          origem: 'FICHA',
          fichaId: 'ft-pure-batata',
          operador: null,
          ativoParaCompra: true,
          empenhosIngredientes: [{ alimentoId: 'ali-batata-doce-roxa', empenhoId: 'emp-421' }],
        }),
      ],
    }),
    diaPronto('2026-11-04', 'REUNIAO_PEDAGOGICA', {
      ALMOCO: [
        item({ id: 'pronto-reuniao', origem: 'ALIMENTO', alimentoId: 'ali-cenoura', operador: null, perCapitaBruto: 15, empenhoId: 'emp-421' }),
      ],
    }),
    diaPronto('2026-11-05', 'LETIVO', {
      LANCHE_TARDE: [
        item({ id: 'pronto-cenoura', origem: 'ALIMENTO', alimentoId: 'ali-cenoura', operador: null, perCapitaBruto: 15, empenhoId: 'emp-421' }),
      ],
    }),
    diaPronto('2026-11-06', 'FERIADO', {
      LANCHE_MANHA_1: [
        item({ id: 'pronto-feriado', origem: 'ALIMENTO', alimentoId: 'ali-laranja-pera', operador: null, perCapitaBruto: 150, empenhoId: 'emp-421' }),
      ],
    }),
    diaPronto('2026-11-10', 'LETIVO', {
      LANCHE_TARDE: [item({ id: 'pronto-mamao', origem: 'ALIMENTO', alimentoId: 'ali-mamao-formosa', operador: null, perCapitaBruto: 40 })],
    }),
  ],
}]

export const OBSERVACOES_COZINHA_PADRAO =
  'Preparar conforme a ficha técnica. Ajustar a consistência à etapa. Não adicionar açúcar nem sal além do previsto. Alergias e laudos deferidos seguem a substituição da lista de compras.'

const refeicoesPadrao = REFEICOES.map((refeicao) => refeicao.id)

export const agrupamentosCardapio: AgrupamentoCardapio[] = [
  { id: 'agr-bercario-1', nome: 'Berçário 1 (6 a 11 meses)', sigla: 'B1', erudioEtapaIds: [101], ativo: true },
  { id: 'agr-bercario-2', nome: 'Berçário 2', sigla: 'B2', erudioEtapaIds: [102], ativo: true },
  { id: 'agr-maternal', nome: 'Educação Infantil — Maternal', sigla: 'INF', erudioEtapaIds: [201], ativo: true },
  { id: 'agr-pre', nome: 'Educação Infantil — Pré', sigla: 'INF', erudioEtapaIds: [301], ativo: true },
  { id: 'agr-fundamental', nome: 'Ensino Fundamental', sigla: 'EF', erudioEtapaIds: [1, 2, 3, 4, 5, 6, 7, 8, 9], ativo: true },
  { id: 'agr-eja', nome: 'EJA', sigla: 'EJA', erudioEtapaIds: [26, 27], ativo: true },
  { id: 'agr-cedin-alm', nome: 'CEDIN — Almoço', sigla: 'CEDIN ALM', erudioEtapaIds: [101, 102, 201], ativo: true },
  { id: 'agr-cedin-lan', nome: 'CEDIN — Lanche', sigla: 'CEDIN LAN', erudioEtapaIds: [101, 102, 201], ativo: true },
]

export const cardapios: Cardapio[] = [
  {
    id: 'card-modelo-b1',
    nome: 'Berçário 1 — Modelo semanal',
    tipo: 'MODELO',
    status: 'ATIVO',
    erudioEtapaId: 101,
    agrupamentoCardapioId: 'agr-bercario-1',
    refeicoes: refeicoesPadrao,
    observacoesCozinha: OBSERVACOES_COZINHA_PADRAO,
    nutricionistasResponsaveisIds: [124799],
    dias: gradeBercario(),
  },
  {
    id: 'card-mensal-b1',
    nome: 'Berçário 1 — Novembro/2026',
    tipo: 'MENSAL',
    status: 'EM_ALTERACAO',
    erudioEtapaId: 101,
    agrupamentoCardapioId: 'agr-bercario-1',
    refeicoes: refeicoesPadrao,
    observacoesCozinha: OBSERVACOES_COZINHA_PADRAO,
    nutricionistasResponsaveisIds: [124799],
    mes: 11,
    ano: 2026,
    dias: gradeBercario(),
  },
  {
    id: 'card-mensal-b2',
    nome: 'Berçário 2 — Novembro/2026',
    tipo: 'MENSAL',
    status: 'EM_ANALISE_EMPRESA',
    erudioEtapaId: 102,
    agrupamentoCardapioId: 'agr-bercario-2',
    refeicoes: refeicoesPadrao,
    observacoesCozinha: OBSERVACOES_COZINHA_PADRAO,
    nutricionistasResponsaveisIds: [124799],
    mes: 11,
    ano: 2026,
    dias: gradeVazia(),
  },
  {
    id: 'card-mensal-mat',
    nome: 'Maternal I — Novembro/2026',
    tipo: 'MENSAL',
    status: 'PRONTO',
    erudioEtapaId: 201,
    agrupamentoCardapioId: 'agr-maternal',
    refeicoes: refeicoesPadrao,
    observacoesCozinha: OBSERVACOES_COZINHA_PADRAO,
    nutricionistasResponsaveisIds: [114250],
    mes: 11,
    ano: 2026,
    dias: gradeVazia(),
  },
  {
    id: 'card-mensal-pre',
    nome: 'Pré-escola — Novembro/2026',
    tipo: 'MENSAL',
    status: 'NOVO',
    erudioEtapaId: 301,
    agrupamentoCardapioId: 'agr-pre',
    refeicoes: refeicoesPadrao,
    observacoesCozinha: OBSERVACOES_COZINHA_PADRAO,
    nutricionistasResponsaveisIds: [124797],
    mes: 11,
    ano: 2026,
    dias: gradeVazia(),
  },
]

export const referenciasPnae: FaixaPnae[] = [
  {
    id: 'pnae-bercario-1',
    agrupamentoCardapioId: 'agr-bercario-1',
    descricaoFaixa: 'Berçário 1 (6 a 11 meses) - 70% VET',
    ativo: true,
    kcalMin: 250,
    kcalMax: 450,
    proteinaMin: 5,
    proteinaMax: 16,
    lipidiosMin: 3,
    lipidiosMax: 14,
    carboidratosMin: 40,
    carboidratosMax: 95,
    calcioMin: 80,
    calcioMax: 280,
    ferroMin: 0.4,
    ferroMax: 3,
    vitaminaAMin: 10,
    vitaminaAMax: 180,
    vitaminaCMin: 30,
    vitaminaCMax: 160,
    sodioMin: 0,
    sodioMax: 200,
  },
  {
    id: 'pnae-pre',
    agrupamentoCardapioId: 'agr-pre',
    descricaoFaixa: 'Pré-escola - 30% VET',
    ativo: true,
    kcalMin: 180,
    kcalMax: 320,
    proteinaMin: 4,
    proteinaMax: 12,
    lipidiosMin: 3,
    lipidiosMax: 12,
    carboidratosMin: 28,
    carboidratosMax: 70,
    calcioMin: 60,
    calcioMax: 220,
    ferroMin: 0.3,
    ferroMax: 2.5,
    vitaminaAMin: 8,
    vitaminaAMax: 150,
    vitaminaCMin: 15,
    vitaminaCMax: 90,
    sodioMin: 0,
    sodioMax: 280,
  },
  {
    id: 'pnae-fundamental',
    agrupamentoCardapioId: 'agr-fundamental',
    descricaoFaixa: 'Ensino Fundamental - 20% VET',
    ativo: true,
    kcalMin: 150,
    kcalMax: 280,
    proteinaMin: 4,
    proteinaMax: 11,
    lipidiosMin: 3,
    lipidiosMax: 11,
    carboidratosMin: 22,
    carboidratosMax: 60,
    calcioMin: 50,
    calcioMax: 200,
    ferroMin: 0.3,
    ferroMax: 2.2,
    vitaminaAMin: 8,
    vitaminaAMax: 140,
    vitaminaCMin: 12,
    vitaminaCMax: 80,
    sodioMin: 0,
    sodioMax: 320,
  },
]

export const FAIXAS_COMPARACAO: { chave: FaixaChave; rotulo: string; unidade: string; origem: keyof ComposicaoNutricional }[] = [
  { chave: 'kcal', rotulo: 'Energia', unidade: 'kcal', origem: 'kcal' },
  { chave: 'proteina', rotulo: 'Proteína', unidade: 'g', origem: 'proteina' },
  { chave: 'lipidios', rotulo: 'Lipídios', unidade: 'g', origem: 'lipidios' },
  { chave: 'carboidratos', rotulo: 'Carboidratos', unidade: 'g', origem: 'carboidratos' },
  { chave: 'calcio', rotulo: 'Cálcio', unidade: 'mg', origem: 'calcio' },
  { chave: 'ferro', rotulo: 'Ferro', unidade: 'mg', origem: 'ferro' },
  { chave: 'vitaminaA', rotulo: 'Vitamina A (retinol)', unidade: 'mcg', origem: 'retinol' },
  { chave: 'vitaminaC', rotulo: 'Vitamina C', unidade: 'mg', origem: 'vitaminaC' },
  { chave: 'sodio', rotulo: 'Sódio', unidade: 'mg', origem: 'sodio' },
]

export function copiar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T
}

export function composicaoVazia(): ComposicaoNutricional {
  return zero()
}

export function safraPadrao(): { mes: number; status: StatusSafra }[] {
  return MESES.map((mes) => ({ mes: mes.valor, status: 'FORA_SAFRA' as const }))
}

export function fatorCorrecao(bruto: number, liquido: number): number | null {
  if (!Number.isFinite(bruto) || !Number.isFinite(liquido) || liquido <= 0) return null
  return Number((bruto / liquido).toFixed(2))
}

export function nutrienteDe(alimento: Alimento | undefined, gramas: number): ComposicaoNutricional {
  const total = zero()
  if (!alimento || gramas <= 0) return total
  const fator = gramas / 100
  for (const nutriente of NUTRIENTES) {
    total[nutriente.chave] = alimento.composicaoNutricional[nutriente.chave] * fator
  }
  return total
}

export function somarComposicao(lista: ComposicaoNutricional[]): ComposicaoNutricional {
  const total = zero()
  for (const item of lista) {
    for (const nutriente of NUTRIENTES) total[nutriente.chave] += item[nutriente.chave]
  }
  return total
}

export function mediaComposicao(lista: ComposicaoNutricional[]): ComposicaoNutricional {
  if (lista.length === 0) return zero()
  const soma = somarComposicao(lista)
  for (const nutriente of NUTRIENTES) soma[nutriente.chave] /= lista.length
  return soma
}

export function nutricaoFicha(ficha: FichaTecnica, catalogo: Alimento[]): ComposicaoNutricional {
  return somarComposicao(
    ficha.ingredientes.map((ingrediente) =>
      nutrienteDe(
        catalogo.find((alimento) => alimento.id === ingrediente.alimentoId),
        ingrediente.perCapitaLiquido,
      ),
    ),
  )
}

export function nutricaoItens(
  itens: ItemGrade[],
  catalogo: Alimento[],
  fichas: FichaTecnica[],
): ComposicaoNutricional {
  if (itens.length === 0) return zero()
  const grupos: ItemGrade[][] = []
  for (const entrada of itens) {
    const ultimo = grupos[grupos.length - 1]
    if (!ultimo || entrada.operador !== 'OU') grupos.push([entrada])
    else ultimo.push(entrada)
  }
  const partes = grupos.map((grupo) => {
    const opcoes = grupo.map((entrada) => {
      if (entrada.origem === 'FICHA') {
        const ficha = fichas.find((item) => item.id === entrada.fichaId)
        return ficha ? nutricaoFicha(ficha, catalogo) : zero()
      }
      return nutrienteDe(
        catalogo.find((alimento) => alimento.id === entrada.alimentoId),
        entrada.perCapitaLiquido ?? 0,
      )
    })
    return mediaComposicao(opcoes)
  })
  return somarComposicao(partes)
}

export function rotuloCategoria(categoria: string): string {
  const nomes: Record<string, string> = {
    FRUTA: 'Fruta',
    LEGUME: 'Legume',
    VERDURA: 'Verdura',
    CEREAL_GRAO: 'Cereal e grão',
    PROTEINA: 'Proteína',
    LATICINIO: 'Laticínio',
    OUTROS: 'Outros',
  }
  return nomes[categoria] ?? categoria
}

export function rotuloUnidade(unidade: string): string {
  const nomes: Record<string, string> = {
    KG: 'kg',
    DUZIA: 'dúzia',
    MACO: 'maço',
    UNIDADE: 'unidade',
    LITRO: 'litro',
    GRAMA: 'grama',
  }
  return nomes[unidade] ?? unidade
}

export function rotuloStatusCardapio(status: string): string {
  const nomes: Record<string, string> = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    NOVO: 'Novo',
    EM_ALTERACAO: 'Em alteração',
    EM_ANALISE_EMPRESA: 'Em análise da empresa',
    PRONTO: 'Pronto',
  }
  return nomes[status] ?? status
}

export function rotuloEvento(evento: string): string {
  const nomes: Record<string, string> = {
    REAJUSTE_PRECO: 'Reajuste de preço',
    INCLUSAO_ALIMENTO: 'Inclusão de alimento',
    ACRESCIMO_QUANTIDADE: 'Acréscimo de quantidade',
    INATIVACAO_ALIMENTO: 'Inativação de alimento',
  }
  return nomes[evento] ?? evento
}

export function rotuloTipoDia(tipo: string): string {
  const nomes: Record<string, string> = {
    LETIVO: 'Letivo',
    FERIADO: 'Feriado',
    REUNIAO_PEDAGOGICA: 'Reunião pedagógica',
    RECESSO: 'Recesso',
  }
  return nomes[tipo] ?? tipo
}

export function rotuloSafra(status: string): string {
  const nomes: Record<string, string> = {
    SAFRA_PLENA: 'Safra plena',
    MEDIA_PRODUCAO: 'Média produção',
    FORA_SAFRA: 'Fora de safra',
  }
  return nomes[status] ?? status
}

export function valorContratado(contrato: ContratoHorti): number {
  return contrato.itens
    .filter((item) => item.ativo)
    .reduce((soma, item) => soma + item.qtdTotalLicitada * item.valorUnitario, 0)
}

export function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function numero(valor: number, casas = 1): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

export function nomeEtapa(id: number): string {
  return etapas.find((etapa) => etapa.erudioEtapaId === id)?.nome ?? `Etapa ${id}`
}

export function nomeMes(mes: number): string {
  return MESES.find((item) => item.valor === mes)?.nome ?? String(mes)
}

export function diasEntregaTexto(dias: number[]): string {
  const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return dias.map((dia) => nomes[dia] ?? String(dia)).join(', ')
}

// @ts-nocheck
/**
 * Seed: importa os mocks do front-end (`front-end/src/mocks/nutricao.mock.ts`)
 * para o MongoDB, convertendo ids string ('ali-...', 'grp-...') em ObjectIds.
 *
 * Uso: npm run seed  (a partir de back-end/)
 */
import mongoose, { Types } from 'mongoose';
import {
  alimentacoesEspeciais,
  agrupamentosCardapio,
  alimentos,
  cardapios,
  cardapiosParaCompra,
  contratosHorti,
  configuracoesAlmocoContraturnoMock,
  demandasEscolares,
  empenhos,
  eventosContrato,
  fichasTecnicas,
  gruposIncidencia,
  incidenciasRegras,
  matriculasEscolares,
  referenciasPnae,
} from '../../front-end/src/mocks/nutricao.mock';
import { REFEICOES } from '../../front-end/src/types/nutricao';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/sistema-nutri';

const ids = new Map<string, Types.ObjectId>();
function oid(antigo: string): Types.ObjectId {
  let id = ids.get(antigo);
  if (!id) {
    id = new Types.ObjectId();
    ids.set(antigo, id);
  }
  return id;
}
function hex(antigo: string | null | undefined): string | undefined {
  return antigo ? oid(antigo).toString() : undefined;
}
function data(valor: string | undefined): Date | undefined {
  return valor ? new Date(`${valor}T00:00:00.000Z`) : undefined;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error('Sem conexão com o MongoDB');

  const colecoes = [
    'grupos_incidencia',
    'alimentos',
    'fichas_tecnicas',
    'agrupamentos_cardapio',
    'referencias_nutricionais_pnae',
    'incidencias_regra',
    'contratos_horti',
    'contratos_horti_historico',
    'empenhos',
    'cardapios',
    'demandas_escolares',
    'matriculas_escolares',
    'configuracoes_unidade_ensino',
    'configuracoes_gerais',
    'alimentacoes_especiais',
    'tipos_refeicao',
    'tipos_restricao',
    'adaptacoes_cardapio',
    'adaptacao_overrides',
    'regras_refeicao_turno',
  ];
  for (const nome of colecoes) {
    await db.collection(nome).deleteMany({});
  }

  await db.collection('grupos_incidencia').insertMany(
    gruposIncidencia.map((grupo) => ({
      _id: oid(grupo.id),
      nome: grupo.nome,
      categoriaVisual: grupo.categoriaVisual,
      origemRegra: grupo.origemRegra,
      ativo: grupo.ativo,
    })),
  );

  await db.collection('alimentos').insertMany(
    alimentos.map((alimento) => ({
      _id: oid(alimento.id),
      nome: alimento.nome,
      categoria: alimento.categoria,
      unidadeMedidaPadrao: alimento.unidadeMedidaPadrao,
      gruposIncidenciaIds: alimento.gruposIncidenciaIds.map(oid),
      composicaoNutricional: alimento.composicaoNutricional,
      safraMensal: alimento.safraMensal,
      restricoesEtapaFnde: alimento.restricoesEtapaFnde,
      ativo: alimento.ativo,
    })),
  );

  await db.collection('fichas_tecnicas').insertMany(
    fichasTecnicas.map((ficha) => ({
      _id: oid(ficha.id),
      nome: ficha.nome,
      modoPreparo: ficha.modoPreparo,
      rendimentoTotalGramas: ficha.rendimentoTotalGramas,
      fatorCoccao: ficha.fatorCoccao,
      ingredientes: ficha.ingredientes.map((ingrediente) => ({
        id: ingrediente.id,
        alimentoId: hex(ingrediente.alimentoId),
        perCapitaBruto: ingrediente.perCapitaBruto,
        perCapitaLiquido: ingrediente.perCapitaLiquido,
      })),
      porcoesEtapa: ficha.porcoesEtapa,
      gruposIncidenciaIds: ficha.gruposIncidenciaIds.map(oid),
    })),
  );

  await db.collection('agrupamentos_cardapio').insertMany(
    agrupamentosCardapio.map((agrupamento) => ({
      _id: oid(agrupamento.id),
      nome: agrupamento.nome,
      sigla: agrupamento.sigla,
      erudioEtapaIds: agrupamento.erudioEtapaIds,
      ativo: agrupamento.ativo,
    })),
  );

  await db.collection('referencias_nutricionais_pnae').insertMany(
    referenciasPnae.map((faixa) => {
      const { id, agrupamentoCardapioId, ...limites } = faixa;
      return {
        _id: oid(id),
        agrupamentoCardapioId: oid(agrupamentoCardapioId),
        ...limites,
      };
    }),
  );

  await db.collection('incidencias_regra').insertMany(
    incidenciasRegras.map((regra) => ({
      _id: oid(regra.id),
      contratoTerceirizadaId: regra.contratoTerceirizadaId,
      tipoAlvo: regra.tipoAlvo,
      grupoIncidenciaId: regra.grupoIncidenciaId ? oid(regra.grupoIncidenciaId) : null,
      fichaTecnicaId: regra.fichaTecnicaId ? oid(regra.fichaTecnicaId) : null,
      alimentoId: regra.alimentoId ? oid(regra.alimentoId) : null,
      agrupamentoCardapioId: oid(regra.agrupamentoCardapioId),
      periodo: regra.periodo,
      frequenciaMinima: regra.frequenciaMinima,
      frequenciaMaxima: regra.frequenciaMaxima,
      ativo: regra.ativo,
    })),
  );

  await db.collection('contratos_horti').insertMany(
    contratosHorti.map((contrato) => ({
      _id: oid(contrato.id),
      numeroContrato: contrato.numeroContrato,
      fornecedorNome: contrato.fornecedorNome,
      fornecedorCnpj: contrato.fornecedorCnpj,
      agriculturaFamiliar: contrato.agriculturaFamiliar,
      vigenciaInicio: data(contrato.vigenciaInicio),
      vigenciaFim: data(contrato.vigenciaFim),
      arredondamentoTotalAlimentos: contrato.arredondamentoTotalAlimentos,
      itens: contrato.itens.map((item) => ({
        alimentoId: oid(item.alimentoId),
        unidadeMedida: item.unidadeMedida,
        qtdTotalLicitada: item.qtdTotalLicitada,
        valorUnitario: item.valorUnitario,
        perCapita: item.perCapita,
        fatorCorrecao: item.fatorCorrecao,
        diasSemanaEntrega: item.diasSemanaEntrega,
        ativo: item.ativo,
      })),
      ativo: contrato.ativo,
    })),
  );

  await db.collection('contratos_horti_historico').insertMany(
    eventosContrato.map((evento) => ({
      _id: oid(evento.id),
      contratoHortiId: oid(evento.contratoHortiId),
      tipoEvento: evento.tipoEvento,
      numeroDocumento: evento.numeroDocumento,
      dataVigencia: data(evento.dataVigencia),
      alimentoId: evento.alimentoId ? oid(evento.alimentoId) : undefined,
      unidadeMedida: evento.unidadeMedida,
      valorAnterior: evento.valorAnterior,
      valorNovo: evento.valorNovo,
      qtdAnterior: evento.qtdAnterior,
      qtdNova: evento.qtdNova,
      motivo: evento.motivo,
      autorUsuarioId: evento.autorUsuarioId,
      createdAt: new Date(evento.createdAt),
    })),
  );

  await db.collection('empenhos').insertMany(
    empenhos.map((empenho) => ({
      _id: oid(empenho.id),
      contratoHortiId: oid(empenho.contratoHortiId),
      numeroEmpenho: empenho.numeroEmpenho,
      fonteRecurso: empenho.fonteRecurso,
      dataInicio: data(empenho.dataInicio),
      dataFim: data(empenho.dataFim),
      itensEmpenhados: empenho.itensEmpenhados.map((item) => ({
        alimentoId: oid(item.alimentoId),
        qtdEmpenhada: item.qtdEmpenhada,
        qtdConsumida: item.qtdConsumida,
        unidadeMedida: item.unidadeMedida,
        valorUnitario: item.valorUnitario,
        previsaoMensal: item.previsaoMensal,
      })),
      ativo: empenho.ativo,
    })),
  );

  function mapItem(item: (typeof cardapios)[number]['dias'][number]['refeicoes'][number]['itens'][number]) {
    return {
      id: item.id,
      origem: item.origem,
      operador: item.operador ?? null,
      ativoParaCompra: item.ativoParaCompra ?? true,
      fichaTecnicaId: hex(item.fichaId),
      alimentoId: hex(item.alimentoId),
      perCapitaLiquido: item.perCapitaLiquido,
      perCapitaBruto: item.perCapitaBruto ?? (item.origem === 'ALIMENTO' ? item.perCapitaLiquido : undefined),
      empenhoId: hex(item.empenhoId),
      empenhosIngredientes: (item.empenhosIngredientes ?? []).map((vinculo) => ({
        alimentoId: hex(vinculo.alimentoId),
        empenhoId: hex(vinculo.empenhoId),
      })),
    };
  }

  await db.collection('cardapios').insertMany(
    [...cardapios, ...cardapiosParaCompra].map((cardapio) => ({
      _id: oid(cardapio.id),
      nome: cardapio.nome,
      tipo: cardapio.tipo,
      status: cardapio.status,
      erudioEtapaId: cardapio.erudioEtapaId,
      agrupamentoCardapioId: cardapio.agrupamentoCardapioId ? oid(cardapio.agrupamentoCardapioId) : undefined,
      refeicoes: cardapio.refeicoes ?? [],
      observacoesCozinha: cardapio.observacoesCozinha,
      nutricionistasResponsaveisIds: cardapio.nutricionistasResponsaveisIds ?? [],
      mes: cardapio.mes,
      ano: cardapio.ano,
      dias: cardapio.dias.map((dia) => ({
        data: data(dia.data),
        tipoDia: dia.tipoDia,
        numeroSemana: dia.numeroSemana,
        diaSemana: dia.diaSemana,
        erudioEtapaId: dia.erudioEtapaId,
        refeicoes: dia.refeicoes.map((refeicao) => ({
          refeicao: refeicao.refeicao,
          itens: refeicao.itens.map(mapItem),
        })),
      })),
    })),
  );

  await db.collection('demandas_escolares').insertMany(demandasEscolares);

  await db.collection('matriculas_escolares').insertMany(
    matriculasEscolares.map((matricula) => ({
      erudioEnturmacaoId: matricula.erudioEnturmacaoId ?? 90000 + matricula.erudioMatriculaId,
      erudioMatriculaId: matricula.erudioMatriculaId,
      erudioAlunoId: matricula.erudioAlunoId,
      erudioUnidadeEnsinoId: matricula.erudioUnidadeEnsinoId,
      nomeEscola: matricula.nomeEscola,
      erudioEtapaId: matricula.erudioEtapaId,
      erudioTurnoId: matricula.erudioTurnoId,
      dataEfetivacao: matricula.dataEfetivacao ? new Date(`${matricula.dataEfetivacao}T00:00:00.000Z`) : undefined,
      dataEncerramento: matricula.dataEncerramento ? new Date(`${matricula.dataEncerramento}T00:00:00.000Z`) : null,
      situacao: matricula.situacao ?? 'CURSANDO',
    })),
  );

  await db.collection('configuracoes_unidade_ensino').insertMany(
    configuracoesAlmocoContraturnoMock.map((config) => ({
      erudioUnidadeEnsinoId: config.erudioUnidadeEnsinoId,
      nomeEscola: config.nomeEscola,
      ofereceAlmocoContraturno: config.ofereceAlmocoContraturno,
    })),
  );

  await db.collection('configuracoes_gerais').insertMany([
    {
      chave: 'ALOCACAO_ALMOCO_CONTRATURNO',
      valor: 'TURNO_MATUTINO',
      descricao: 'Desempate do almoço do aluno em contraturno quando ambas as unidades oferecem',
    },
  ]);

  await db.collection('tipos_restricao').insertMany([
    { id: 'APLV', nome: 'Alergia à Proteína do Leite de Vaca', ativo: true },
    { id: 'INTOLERANCIA_LACTOSE', nome: 'Intolerância à Lactose', ativo: true },
    { id: 'DOENCA_CELIACA', nome: 'Doença Celíaca', ativo: true },
    { id: 'DIABETES', nome: 'Diabetes', ativo: true },
    { id: 'SEM_GLUTEN', nome: 'Intolerância ao Glúten (não celíaca)', ativo: true },
  ]);

  await db.collection('tipos_refeicao').insertMany(
    REFEICOES.map((refeicao, indice) => ({
      id: refeicao.id,
      nome: refeicao.nome,
      ordem: indice + 1,
      ativo: true,
    })),
  );

  await db.collection('alimentacoes_especiais').insertMany(
    alimentacoesEspeciais.map((especial) => ({
      erudioMatriculaId: especial.erudioMatriculaId,
      erudioUnidadeEnsinoId: especial.erudioUnidadeEnsinoId,
      erudioEtapaId: especial.erudioEtapaId,
      status: especial.status,
      alimentosNaoUtilizadosIds: especial.alimentosNaoUtilizadosIds.map((id) => hex(id)),
      alimentosUtilizadosIds: especial.alimentosUtilizadosIds.map((id) => hex(id)),
    })),
  );

  console.log('Seed concluído:', {
    grupos: gruposIncidencia.length,
    alimentos: alimentos.length,
    fichas: fichasTecnicas.length,
    agrupamentos: agrupamentosCardapio.length,
    referencias: referenciasPnae.length,
    regras: incidenciasRegras.length,
    contratos: contratosHorti.length,
    historico: eventosContrato.length,
    empenhos: empenhos.length,
    cardapios: cardapios.length + cardapiosParaCompra.length,
    demandas: demandasEscolares.length,
    tiposRefeicao: REFEICOES.length,
    especiais: alimentacoesEspeciais.length,
  });

  await mongoose.disconnect();
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});

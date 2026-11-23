import { UnidadeMedida } from '../../common/enums/index.js';
import { calcularRomaneio, type EntradaRomaneio } from './calcular-romaneio.js';

function entrada(parcial: Partial<EntradaRomaneio> = {}): EntradaRomaneio {
  return {
    datasSelecionadas: ['2026-11-02', '2026-11-04'],
    dias: [
      {
        data: '2026-11-02',
        erudioEtapaId: 101,
        tipoDia: 'LETIVO',
        refeicoes: [
          {
            itens: [
              {
                operador: null,
                ativoParaCompra: true,
                fichaTecnicaId: 'ft',
              },
              { operador: 'OU', ativoParaCompra: false, alimentoId: 'banana', perCapitaBruto: 40 },
            ],
          },
        ],
      },
      {
        data: '2026-11-04',
        erudioEtapaId: 101,
        tipoDia: 'FERIADO',
        refeicoes: [
          {
            itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'laranja', perCapitaBruto: 150 }],
          },
        ],
      },
    ],
    fichas: [{ id: 'ft', ingredientes: [{ alimentoId: 'laranja', perCapitaBruto: 150 }, { alimentoId: 'oleo', perCapitaBruto: 2 }] }],
    alimentos: [
      { id: 'laranja', nome: 'Laranja Pera', categoria: 'FRUTA' },
      { id: 'banana', nome: 'Banana Prata', categoria: 'FRUTA' },
      { id: 'oleo', nome: 'Óleo', categoria: 'OUTROS' },
      { id: 'tomate', nome: 'Tomate', categoria: 'VERDURA' },
    ],
    itensContrato: [
      { alimentoId: 'laranja', unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4, ativo: true },
      { alimentoId: 'banana', unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.9, ativo: true },
      { alimentoId: 'tomate', unidadeMedida: UnidadeMedida.KG, valorUnitario: 5, ativo: true },
    ],
    empenhos: [
      {
        id: 'emp',
        contratoHortiId: 'ct',
        numeroEmpenho: '2026NE00421',
        ativo: true,
        itensEmpenhados: [{ alimentoId: 'laranja', qtdEmpenhada: 10, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4 }],
      },
      {
        id: 'emp-b',
        contratoHortiId: 'ct',
        numeroEmpenho: '2026NE00488',
        ativo: true,
        itensEmpenhados: [{ alimentoId: 'banana', qtdEmpenhada: 10, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.9 }],
      },
    ],
    demandas: [
      { erudioUnidadeEnsinoId: 501, erudioEtapaId: 101, nomeEscola: 'CMEI Pequeno Príncipe', alunosAtivos: 8 },
      { erudioUnidadeEnsinoId: 502, erudioEtapaId: 101, nomeEscola: 'CMEI Maré Alta', alunosAtivos: 2 },
    ],
    especiais: [
      {
        erudioMatriculaId: 9001,
        erudioUnidadeEnsinoId: 501,
        erudioEtapaId: 101,
        status: 'DEFERIDO',
        alimentosNaoUtilizadosIds: ['laranja'],
        alimentosUtilizadosIds: ['banana'],
      },
    ],
    consumosAnteriores: [],
    arredondamentoTotalAlimentos: true,
    ...parcial,
  };
}

describe('calcularRomaneio', () => {
  it('ignora feriado, deixa de fora o item OU e troca a porção da alimentação especial', () => {
    const resultado = calcularRomaneio(entrada());
    expect(resultado.itensPendentes).toEqual([]);
    expect(resultado.datasIgnoradas).toEqual(['2026-11-04']);
    expect(resultado.consolidado).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          alimentoId: 'laranja',
          quantidadeCalculada: 1.35,
          quantidadePedida: 2,
          candidatos: [expect.objectContaining({ empenhoId: 'emp', saldoDisponivel: 10 })],
        }),
        expect.objectContaining({
          alimentoId: 'banana',
          quantidadeCalculada: 0.15,
          quantidadePedida: 1,
          candidatos: [expect.objectContaining({ empenhoId: 'emp-b' })],
        }),
      ]),
    );
    expect(resultado.consolidado.some((item) => item.alimentoId === 'oleo')).toBe(false);
    const escola = resultado.romaneio.find((item) => item.erudioUnidadeEnsinoId === 501);
    expect(escola?.substituicoesAplicadas).toEqual([
      expect.objectContaining({ erudioMatriculaId: 9001, alimentoOrigemId: 'laranja', alimentoDestinoId: 'banana', quantidadeGramas: 150 }),
    ]);
  });

  it('lista alimento sem empenho ativo que o atenda', () => {
    const dados = entrada({ especiais: [] });
    dados.dias[0]?.refeicoes[0]?.itens.push({
      operador: null,
      ativoParaCompra: true,
      alimentoId: 'tomate',
      perCapitaBruto: 80,
    });
    const resultado = calcularRomaneio(dados);
    expect(resultado.itensPendentes).toEqual([
      expect.objectContaining({ alimentoId: 'tomate', motivo: 'SEM_EMPENHO' }),
    ]);
    const tomate = resultado.consolidado.find((item) => item.alimentoId === 'tomate');
    expect(tomate?.candidatos).toEqual([]);
  });

  it('valida rateio: saldo insuficiente quando o rateio excede o empenho', () => {
    const dados = entrada({
      especiais: [],
      alocacoes: [
        { alimentoId: 'laranja', rateios: [{ empenhoId: 'emp', quantidade: 12 }] },
      ],
    });
    const resultado = calcularRomaneio(dados);
    expect(resultado.itensPendentes).toEqual([
      expect.objectContaining({ alimentoId: 'laranja', motivo: 'SEM_SALDO', empenhoId: 'emp', quantidadeNecessaria: 12, saldoDisponivel: 10 }),
    ]);
    const laranja = resultado.consolidado.find((item) => item.alimentoId === 'laranja');
    expect(laranja?.alocacoes).toEqual([
      expect.objectContaining({ empenhoId: 'emp', quantidade: 12, saldoRestante: -2, valorTotal: 40.8 }),
    ]);
    expect(laranja?.totalAlocado).toBe(12);
  });

  it('sinaliza rateio insuficiente quando o total alocado não cobre a demanda', () => {
    const dados = entrada({
      especiais: [],
      alocacoes: [
        { alimentoId: 'laranja', rateios: [{ empenhoId: 'emp', quantidade: 1 }] },
      ],
    });
    const resultado = calcularRomaneio(dados);
    expect(resultado.itensPendentes).toEqual([
      expect.objectContaining({ alimentoId: 'laranja', motivo: 'RATEIO_INSUFICIENTE', quantidadeNecessaria: 2, quantidadeAlocada: 1 }),
    ]);
  });

  it('sugere rateio entre empenhos esgotando primeiro o que vence antes', () => {
    const dados = entrada({
      especiais: [],
      empenhos: [
        {
          id: 'emp-tardio',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE0002',
          ativo: true,
          dataFim: new Date('2026-12-31'),
          itensEmpenhados: [{ alimentoId: 'laranja', qtdEmpenhada: 10, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4 }],
        },
        {
          id: 'emp-cedo',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE0001',
          ativo: true,
          dataFim: new Date('2026-06-30'),
          itensEmpenhados: [{ alimentoId: 'laranja', qtdEmpenhada: 1, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4 }],
        },
        {
          id: 'emp-b',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE00488',
          ativo: true,
          dataFim: new Date('2026-12-31'),
          itensEmpenhados: [{ alimentoId: 'banana', qtdEmpenhada: 10, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.9 }],
        },
      ],
    });
    const resultado = calcularRomaneio(dados);
    expect(resultado.itensPendentes).toEqual([]);
    const laranja = resultado.consolidado.find((item) => item.alimentoId === 'laranja');
    expect(laranja?.rateioSugerido).toBe(true);
    expect(laranja?.alocacoes.map((alocacao) => [alocacao.empenhoId, alocacao.quantidade])).toEqual([
      ['emp-cedo', 1],
      ['emp-tardio', 1],
    ]);
    expect(laranja?.totalAlocado).toBe(2);
    expect(resultado.alocacoesEfetivas).toEqual([
      { alimentoId: 'laranja', rateios: [{ empenhoId: 'emp-cedo', quantidade: 1 }, { empenhoId: 'emp-tardio', quantidade: 1 }] },
    ]);
  });

  it('alerta déficit quando o saldo total dos empenhos não cobre a demanda', () => {
    const dados = entrada({
      especiais: [],
      empenhos: [
        {
          id: 'emp',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE00421',
          ativo: true,
          dataFim: new Date('2026-12-31'),
          itensEmpenhados: [{ alimentoId: 'laranja', qtdEmpenhada: 1, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4 }],
        },
        {
          id: 'emp-b',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE00488',
          ativo: true,
          dataFim: new Date('2026-12-31'),
          itensEmpenhados: [{ alimentoId: 'banana', qtdEmpenhada: 10, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.9 }],
        },
      ],
    });
    const resultado = calcularRomaneio(dados);
    expect(resultado.itensPendentes).toEqual([
      expect.objectContaining({
        alimentoId: 'laranja',
        motivo: 'RATEIO_INSUFICIENTE',
        quantidadeNecessaria: 2,
        quantidadeAlocada: 1,
        saldoTotalDisponivel: 1,
      }),
    ]);
    const laranja = resultado.consolidado.find((item) => item.alimentoId === 'laranja');
    expect(laranja?.rateioSugerido).toBe(true);
    expect(laranja?.alocacoes).toEqual([expect.objectContaining({ empenhoId: 'emp', quantidade: 1, saldoRestante: 0 })]);
  });

  it('filtra o escopo por unidade de ensino', () => {
    const dados = entrada({ especiais: [], erudioUnidadeEnsinoIds: [501] });
    const resultado = calcularRomaneio(dados);
    const laranja = resultado.consolidado.find((item) => item.alimentoId === 'laranja');
    // Só a unidade 501 (8 alunos) entra: 150 g × 8 = 1,2 kg
    expect(laranja?.quantidadeCalculada).toBe(1.2);
    expect(resultado.romaneio.length).toBeGreaterThan(0);
    expect(resultado.romaneio.every((escola) => escola.erudioUnidadeEnsinoId === 501)).toBe(true);
  });

  it('filtra o escopo por etapa de ensino', () => {
    const dados = entrada({ erudioEtapaIds: [999] });
    const resultado = calcularRomaneio(dados);
    expect(resultado.consolidado).toEqual([]);
    expect(resultado.romaneio).toEqual([]);
  });
});

function entradaContraturno(parcial: Partial<EntradaRomaneio> = {}): EntradaRomaneio {
  return entrada({
    datasSelecionadas: ['2026-11-03'],
    dias: [
      {
        data: '2026-11-03',
        erudioEtapaId: 10,
        tipoDia: 'LETIVO',
        refeicoes: [
          { refeicao: 'LANCHE_MANHA_1', itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'laranja', perCapitaBruto: 100 }] },
          { refeicao: 'ALMOCO', itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'tomate', perCapitaBruto: 200 }] },
          { refeicao: 'LANCHE_TARDE', itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'banana', perCapitaBruto: 50 }] },
        ],
      },
    ],
    fichas: [],
    demandas: [],
    especiais: [],
    regrasRefeicao: [
      { erudioEtapaId: 10, erudioTurnoId: 1, refeicaoId: 'LANCHE_MANHA_1', erudioUnidadeEnsinoId: null, ativo: true },
      { erudioEtapaId: 10, erudioTurnoId: 2, refeicaoId: 'LANCHE_TARDE', erudioUnidadeEnsinoId: null, ativo: true },
    ],
    matriculas: [
      // Turno único matutino
      { erudioMatriculaId: 1, erudioAlunoId: 9001, erudioUnidadeEnsinoId: 501, nomeEscola: 'Escola A', erudioEtapaId: 10, erudioTurnoId: 1 },
      // Contraturno: ambas oferecem almoço → desempate matutino (601)
      { erudioMatriculaId: 2, erudioAlunoId: 9002, erudioUnidadeEnsinoId: 601, nomeEscola: 'Escola B', erudioEtapaId: 10, erudioTurnoId: 1 },
      { erudioMatriculaId: 3, erudioAlunoId: 9002, erudioUnidadeEnsinoId: 602, nomeEscola: 'Escola C', erudioEtapaId: 10, erudioTurnoId: 2 },
      // Contraturno: só a 603 oferece → almoço vai para ela mesmo sendo turno vespertino
      { erudioMatriculaId: 4, erudioAlunoId: 9003, erudioUnidadeEnsinoId: 603, nomeEscola: 'Escola D', erudioEtapaId: 10, erudioTurnoId: 1 },
      { erudioMatriculaId: 5, erudioAlunoId: 9003, erudioUnidadeEnsinoId: 604, nomeEscola: 'Escola E', erudioEtapaId: 10, erudioTurnoId: 2 },
      // Turno único vespertino
      { erudioMatriculaId: 6, erudioAlunoId: 9004, erudioUnidadeEnsinoId: 605, nomeEscola: 'Escola F', erudioEtapaId: 10, erudioTurnoId: 2 },
      // Turno integral: fica o dia inteiro e consome todas as refeições da etapa
      { erudioMatriculaId: 7, erudioAlunoId: 9005, erudioUnidadeEnsinoId: 606, nomeEscola: 'Escola G', erudioEtapaId: 10, erudioTurnoId: 4 },
    ],
    configuracoesAlmocoContraturno: [
      { erudioUnidadeEnsinoId: 601, ofereceAlmocoContraturno: true },
      { erudioUnidadeEnsinoId: 602, ofereceAlmocoContraturno: true },
      { erudioUnidadeEnsinoId: 603, ofereceAlmocoContraturno: true },
      { erudioUnidadeEnsinoId: 604, ofereceAlmocoContraturno: false },
    ],
    alocacaoAlmocoContraturnoPadrao: 'TURNO_MATUTINO',
    ...parcial,
  });
}

function quantidadeNaEscola(resultado: ReturnType<typeof calcularRomaneio>, unidade: number, alimentoId: string): number {
  const escola = resultado.romaneio.find((item) => item.erudioUnidadeEnsinoId === unidade);
  return escola?.itens.find((item) => item.alimentoId === alimentoId)?.quantidade ?? 0;
}

describe('calcularRomaneio — contraturno', () => {
  it('conta lanches por unidade/turno e o almoço uma única vez na unidade do turno matutino', () => {
    const resultado = calcularRomaneio(entradaContraturno());

    // Turno único matutino: só lanche da manhã
    expect(quantidadeNaEscola(resultado, 501, 'laranja')).toBe(0.1);
    expect(quantidadeNaEscola(resultado, 501, 'tomate')).toBe(0);
    expect(quantidadeNaEscola(resultado, 501, 'banana')).toBe(0);

    // Contraturno ambas oferecem + padrão matutino: manhã e almoço na 601, tarde na 602
    expect(quantidadeNaEscola(resultado, 601, 'laranja')).toBe(0.1);
    expect(quantidadeNaEscola(resultado, 601, 'tomate')).toBe(0.2);
    expect(quantidadeNaEscola(resultado, 602, 'banana')).toBe(0.05);
    expect(quantidadeNaEscola(resultado, 602, 'tomate')).toBe(0);

    // Só a 603 oferece: almoço vai para ela; a 604 fica só com o lanche da tarde
    expect(quantidadeNaEscola(resultado, 603, 'tomate')).toBe(0.2);
    expect(quantidadeNaEscola(resultado, 604, 'tomate')).toBe(0);
    expect(quantidadeNaEscola(resultado, 604, 'banana')).toBe(0.05);

    // Turno único vespertino: só lanche da tarde
    expect(quantidadeNaEscola(resultado, 605, 'banana')).toBe(0.05);
    expect(quantidadeNaEscola(resultado, 605, 'tomate')).toBe(0);

    // Turno integral: todas as refeições da etapa naquela escola
    expect(quantidadeNaEscola(resultado, 606, 'laranja')).toBe(0.1);
    expect(quantidadeNaEscola(resultado, 606, 'tomate')).toBe(0.2);
    expect(quantidadeNaEscola(resultado, 606, 'banana')).toBe(0.05);

    // Almoço nunca em duplicidade: 2 contraturnos + 1 integral = 3 porções de 200g
    const tomate = resultado.consolidado.find((item) => item.alimentoId === 'tomate');
    expect(tomate?.quantidadeCalculada).toBe(0.6);
  });

  it('usa o desempate TURNO_VESPERTINO quando ambas as unidades oferecem almoço', () => {
    const resultado = calcularRomaneio(entradaContraturno({ alocacaoAlmocoContraturnoPadrao: 'TURNO_VESPERTINO' }));
    expect(quantidadeNaEscola(resultado, 602, 'tomate')).toBe(0.2);
    expect(quantidadeNaEscola(resultado, 601, 'tomate')).toBe(0);
    // Aluno com só uma unidade oferecendo continua nela
    expect(quantidadeNaEscola(resultado, 603, 'tomate')).toBe(0.2);
  });

  it('não serve almoço ao contraturno quando nenhuma unidade oferece', () => {
    const dados = entradaContraturno({
      configuracoesAlmocoContraturno: [
        { erudioUnidadeEnsinoId: 601, ofereceAlmocoContraturno: false },
        { erudioUnidadeEnsinoId: 602, ofereceAlmocoContraturno: false },
      ],
    });
    const resultado = calcularRomaneio(dados);
    // Aluno 9002 (601+602, ambas false) fica sem almoço; aluno 9003 tem 603 e
    // 604 com default true → desempate matutino mantém o almoço na 603.
    expect(quantidadeNaEscola(resultado, 601, 'tomate')).toBe(0);
    expect(quantidadeNaEscola(resultado, 602, 'tomate')).toBe(0);
    expect(quantidadeNaEscola(resultado, 603, 'tomate')).toBe(0.2);
  });

  it('mantém o comportamento agregado quando não há matrículas', () => {
    const dados = entradaContraturno({ matriculas: [] });
    const resultado = calcularRomaneio(dados);
    expect(resultado.romaneio).toEqual([]);
  });

  function diasLetivos(datas: string[]) {
    return datas.map((data) => ({
      data,
      erudioEtapaId: 10,
      tipoDia: 'LETIVO',
      refeicoes: [
        { refeicao: 'LANCHE_MANHA_1', itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'laranja', perCapitaBruto: 100 }] },
      ],
    }));
  }

  it('filtra vínculos pela vigência no dia D (transferência entre unidades)', () => {
    const dados = entradaContraturno({
      datasSelecionadas: ['2026-11-02', '2026-11-05'],
      dias: diasLetivos(['2026-11-02', '2026-11-05']),
      matriculas: [
        // Transferência: unidade 501 até 03/11, unidade 502 a partir de 03/11
        { erudioEnturmacaoId: 1, erudioMatriculaId: 1, erudioAlunoId: 9100, erudioUnidadeEnsinoId: 501, nomeEscola: 'Origem', erudioEtapaId: 10, erudioTurnoId: 1, dataEfetivacao: '2026-01-01', dataEncerramento: '2026-11-03' },
        { erudioEnturmacaoId: 2, erudioMatriculaId: 2, erudioAlunoId: 9100, erudioUnidadeEnsinoId: 502, nomeEscola: 'Destino', erudioEtapaId: 10, erudioTurnoId: 1, dataEfetivacao: '2026-11-03', dataEncerramento: null },
      ],
    });
    const resultado = calcularRomaneio(dados);
    // 02/11 → só a origem; 05/11 → só o destino (encerramento === D já exclui a origem)
    expect(quantidadeNaEscola(resultado, 501, 'laranja')).toBe(0.1);
    expect(quantidadeNaEscola(resultado, 502, 'laranja')).toBe(0.1);
  });

  it('desempata duas enturmações no mesmo turno pela dataEfetivacao mais recente', () => {
    const dados = entradaContraturno({
      matriculas: [
        { erudioEnturmacaoId: 1, erudioMatriculaId: 1, erudioAlunoId: 9101, erudioUnidadeEnsinoId: 501, nomeEscola: 'Antiga', erudioEtapaId: 10, erudioTurnoId: 1, dataEfetivacao: '2026-01-01' },
        { erudioEnturmacaoId: 2, erudioMatriculaId: 2, erudioAlunoId: 9101, erudioUnidadeEnsinoId: 502, nomeEscola: 'Nova', erudioEtapaId: 10, erudioTurnoId: 1, dataEfetivacao: '2026-06-01' },
      ],
    });
    const resultado = calcularRomaneio(dados);
    expect(quantidadeNaEscola(resultado, 501, 'laranja')).toBe(0);
    expect(quantidadeNaEscola(resultado, 502, 'laranja')).toBe(0.1);
  });
});

function entradaAdaptacao(parcial: Partial<EntradaRomaneio> = {}): EntradaRomaneio {
  return entradaContraturno({
    datasSelecionadas: ['2026-11-03'],
    dias: [
      {
        data: '2026-11-03',
        erudioEtapaId: 10,
        tipoDia: 'LETIVO',
        refeicoes: [
          { refeicao: 'LANCHE_MANHA_1', itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'laranja', perCapitaBruto: 100 }] },
        ],
      },
    ],
    fichas: [],
    regrasRefeicao: [
      { erudioEtapaId: 10, erudioTurnoId: 1, refeicaoId: 'LANCHE_MANHA_1', erudioUnidadeEnsinoId: null, ativo: true },
    ],
    ...parcial,
  });
}

describe('calcularRomaneio — adaptação de cardápio (alimentação especial)', () => {
  const matriculasBase = [
    { erudioMatriculaId: 1, erudioAlunoId: 9200, erudioUnidadeEnsinoId: 501, nomeEscola: 'Escola A', erudioEtapaId: 10, erudioTurnoId: 1 },
    { erudioMatriculaId: 2, erudioAlunoId: 9201, erudioUnidadeEnsinoId: 501, nomeEscola: 'Escola A', erudioEtapaId: 10, erudioTurnoId: 1 },
    { erudioMatriculaId: 3, erudioAlunoId: 9202, erudioUnidadeEnsinoId: 501, nomeEscola: 'Escola A', erudioEtapaId: 10, erudioTurnoId: 1 },
  ];

  it('override substitui a refeição só para os alunos do perfil, sem duplicar nem cair na substituição legada', () => {
    const resultado = calcularRomaneio(
      entradaAdaptacao({
        matriculas: matriculasBase,
        especiais: [
          // Aluno 9200: APLV — laudo legado apontaria laranja→tomate, mas o perfil cobre
          { erudioMatriculaId: 1, erudioAlunoId: 9200, erudioUnidadeEnsinoId: 501, erudioEtapaId: 10, status: 'DEFERIDO', alimentosNaoUtilizadosIds: ['laranja'], alimentosUtilizadosIds: ['tomate'], restricaoIds: ['APLV'] },
          // Aluno 9202: APLV + intolerância à lactose no MESMO perfil → conta 1 vez
          { erudioMatriculaId: 3, erudioAlunoId: 9202, erudioUnidadeEnsinoId: 501, erudioEtapaId: 10, status: 'DEFERIDO', alimentosNaoUtilizadosIds: ['laranja'], alimentosUtilizadosIds: ['tomate'], restricaoIds: ['APLV', 'INTOLERANCIA_LACTOSE'] },
        ],
        adaptacoes: [
          {
            id: 'ad-sem-leite',
            erudioEtapaId: 10,
            prioridade: 1,
            restricoesIds: ['APLV', 'INTOLERANCIA_LACTOSE'],
            ativo: true,
            overrides: [
              { data: '2026-11-03', refeicao: 'LANCHE_MANHA_1', itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'banana', perCapitaBruto: 120 }] },
            ],
          },
        ],
      }),
    );

    const escola = resultado.romaneio.find((item) => item.erudioUnidadeEnsinoId === 501);
    // 1 aluno comum come laranja (100g); 2 alunos do perfil comem banana (120g cada)
    expect(escola?.itens.find((item) => item.alimentoId === 'laranja')?.quantidade).toBe(0.1);
    expect(escola?.itens.find((item) => item.alimentoId === 'banana')?.quantidade).toBe(0.24);
    // Laudos cobertos pelo perfil não geram substituição legada
    expect(escola?.substituicoesAplicadas).toEqual([]);
    expect(escola?.itens.some((item) => item.alimentoId === 'tomate')).toBe(false);
  });

  it('perfil sem override no dia herda o cardápio principal', () => {
    const resultado = calcularRomaneio(
      entradaAdaptacao({
        matriculas: matriculasBase,
        especiais: [
          { erudioMatriculaId: 1, erudioAlunoId: 9200, erudioUnidadeEnsinoId: 501, erudioEtapaId: 10, status: 'DEFERIDO', alimentosNaoUtilizadosIds: [], alimentosUtilizadosIds: [], restricaoIds: ['APLV'] },
        ],
        adaptacoes: [
          {
            id: 'ad-sem-leite',
            erudioEtapaId: 10,
            prioridade: 1,
            restricoesIds: ['APLV'],
            ativo: true,
            // Override só em outro dia → hoje o aluno herda o principal
            overrides: [{ data: '2026-11-04', refeicao: 'LANCHE_MANHA_1', itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'banana', perCapitaBruto: 120 }] }],
          },
        ],
      }),
    );

    // Os 3 alunos comem laranja do cardápio principal; banana não aparece
    expect(quantidadeNaEscola(resultado, 501, 'laranja')).toBe(0.3);
    expect(quantidadeNaEscola(resultado, 501, 'banana')).toBe(0);
  });

  it('aluno com restrições em dois perfis cai no de maior prioridade, contado uma vez', () => {
    const resultado = calcularRomaneio(
      entradaAdaptacao({
        matriculas: [matriculasBase[0]!],
        especiais: [
          { erudioMatriculaId: 1, erudioAlunoId: 9200, erudioUnidadeEnsinoId: 501, erudioEtapaId: 10, status: 'DEFERIDO', alimentosNaoUtilizadosIds: [], alimentosUtilizadosIds: [], restricaoIds: ['APLV', 'DOENCA_CELIACA'] },
        ],
        adaptacoes: [
          {
            id: 'ad-prioridade-baixa',
            erudioEtapaId: 10,
            prioridade: 9,
            restricoesIds: ['DOENCA_CELIACA'],
            ativo: true,
            overrides: [{ data: '2026-11-03', refeicao: 'LANCHE_MANHA_1', itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'tomate', perCapitaBruto: 80 }] }],
          },
          {
            id: 'ad-prioridade-alta',
            erudioEtapaId: 10,
            prioridade: 1,
            restricoesIds: ['APLV'],
            ativo: true,
            overrides: [{ data: '2026-11-03', refeicao: 'LANCHE_MANHA_1', itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'banana', perCapitaBruto: 120 }] }],
          },
        ],
      }),
    );

    expect(quantidadeNaEscola(resultado, 501, 'banana')).toBe(0.12);
    expect(quantidadeNaEscola(resultado, 501, 'tomate')).toBe(0);
    expect(quantidadeNaEscola(resultado, 501, 'laranja')).toBe(0);
  });
});

describe('calcularRomaneio — integridade empenho × contrato', () => {
  it('aborta quando a unidadeMedida do empenho diverge da do contrato', () => {
    const dados = entrada({
      itensContrato: [
        { alimentoId: 'laranja', unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4, ativo: true },
      ],
      empenhos: [
        {
          id: 'emp',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE00421',
          ativo: true,
          itensEmpenhados: [{ alimentoId: 'laranja', qtdEmpenhada: 10, unidadeMedida: UnidadeMedida.MACO, valorUnitario: 3.4 }],
        },
      ],
    });
    expect(() => calcularRomaneio(dados)).toThrow(/unidadeMedida 'MACO'.*difere do contrato 'KG'/s);
  });

  it('aborta quando gramasPorUnidade do empenho diverge da do contrato', () => {
    const dados = entrada({
      itensContrato: [
        { alimentoId: 'laranja', unidadeMedida: UnidadeMedida.MACO, valorUnitario: 3.4, ativo: true, gramasPorUnidade: 250 },
      ],
      empenhos: [
        {
          id: 'emp',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE00421',
          ativo: true,
          itensEmpenhados: [
            { alimentoId: 'laranja', qtdEmpenhada: 10, unidadeMedida: UnidadeMedida.MACO, valorUnitario: 3.4, gramasPorUnidade: 300 },
          ],
        },
      ],
    });
    expect(() => calcularRomaneio(dados)).toThrow(/gramasPorUnidade 300 difere do contrato 250/);
  });

  it('converte demanda em MACO usando gramasPorUnidade do contrato', () => {
    const dados = entrada({
      datasSelecionadas: ['2026-11-02'],
      dias: [
        {
          data: '2026-11-02',
          erudioEtapaId: 101,
          tipoDia: 'LETIVO',
          refeicoes: [
            { itens: [{ operador: null, ativoParaCompra: true, alimentoId: 'laranja', perCapitaBruto: 150 }] },
          ],
        },
      ],
      demandas: [{ erudioUnidadeEnsinoId: 501, erudioEtapaId: 101, nomeEscola: 'Escola A', alunosAtivos: 10 }],
      itensContrato: [
        { alimentoId: 'laranja', unidadeMedida: UnidadeMedida.MACO, valorUnitario: 3.4, ativo: true, gramasPorUnidade: 250 },
      ],
      empenhos: [
        {
          id: 'emp',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE00421',
          ativo: true,
          itensEmpenhados: [
            { alimentoId: 'laranja', qtdEmpenhada: 100, unidadeMedida: UnidadeMedida.MACO, valorUnitario: 3.4, gramasPorUnidade: 250 },
          ],
        },
      ],
    });
    const resultado = calcularRomaneio(dados);
    const item = resultado.consolidado.find((i) => i.alimentoId === 'laranja');
    // 10 alunos × 150 g = 1500 g ÷ 250 g/maço = 6 maços
    expect(item?.quantidadeCalculada).toBe(6);
    expect(item?.quantidadePedida).toBe(6);
  });
});

describe('calcularRomaneio — fator de correção (líquido × fatorCorrecao)', () => {
  it('deriva o bruto de perCapitaLiquido × fatorCorrecao do contrato', () => {
    const dados = entrada({
      datasSelecionadas: ['2026-11-02'],
      dias: [
        {
          data: '2026-11-02',
          erudioEtapaId: 101,
          tipoDia: 'LETIVO',
          refeicoes: [
            {
              itens: [
                // líquido 100 g × fator 1,35 = 135 g de compra (ignora o bruto gravado 999)
                { operador: null, ativoParaCompra: true, alimentoId: 'laranja', perCapitaBruto: 999, perCapitaLiquido: 100 },
              ],
            },
          ],
        },
      ],
      demandas: [{ erudioUnidadeEnsinoId: 501, erudioEtapaId: 101, nomeEscola: 'Escola A', alunosAtivos: 10 }],
      itensContrato: [
        { alimentoId: 'laranja', unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4, ativo: true, fatorCorrecao: 1.35 },
      ],
      empenhos: [
        {
          id: 'emp',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE00421',
          ativo: true,
          itensEmpenhados: [{ alimentoId: 'laranja', qtdEmpenhada: 100, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4 }],
        },
      ],
      especiais: [],
    });
    const resultado = calcularRomaneio(dados);
    const item = resultado.consolidado.find((i) => i.alimentoId === 'laranja');
    // 10 alunos × 135 g = 1350 g = 1,35 kg
    expect(item?.quantidadeCalculada).toBe(1.35);
  });

  it('usa perCapitaBruto gravado quando o contrato não tem fatorCorrecao', () => {
    const dados = entrada({
      datasSelecionadas: ['2026-11-02'],
      dias: [
        {
          data: '2026-11-02',
          erudioEtapaId: 101,
          tipoDia: 'LETIVO',
          refeicoes: [
            {
              itens: [
                { operador: null, ativoParaCompra: true, alimentoId: 'laranja', perCapitaBruto: 150, perCapitaLiquido: 100 },
              ],
            },
          ],
        },
      ],
      demandas: [{ erudioUnidadeEnsinoId: 501, erudioEtapaId: 101, nomeEscola: 'Escola A', alunosAtivos: 10 }],
      itensContrato: [
        { alimentoId: 'laranja', unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4, ativo: true },
      ],
      empenhos: [
        {
          id: 'emp',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE00421',
          ativo: true,
          itensEmpenhados: [{ alimentoId: 'laranja', qtdEmpenhada: 100, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4 }],
        },
      ],
      especiais: [],
    });
    const resultado = calcularRomaneio(dados);
    const item = resultado.consolidado.find((i) => i.alimentoId === 'laranja');
    // 10 alunos × 150 g (bruto gravado) = 1,5 kg
    expect(item?.quantidadeCalculada).toBe(1.5);
  });
});

describe('calcularRomaneio — escala de receita-base (ficha técnica)', () => {
  it('escala ingredientes da ficha por porcaoServidaGramas / rendimentoTotalGramas', () => {
    const dados = entrada({
      datasSelecionadas: ['2026-11-02'],
      dias: [
        {
          data: '2026-11-02',
          erudioEtapaId: 101,
          tipoDia: 'LETIVO',
          refeicoes: [
            {
              itens: [
                {
                  operador: null,
                  ativoParaCompra: true,
                  fichaTecnicaId: 'ft-arroz',
                  porcaoServidaGramas: 100,
                },
              ],
            },
          ],
        },
      ],
      fichas: [
        {
          id: 'ft-arroz',
          rendimentoTotalGramas: 2615.8,
          // receita-base: 2615,8 g de arroz cru rendem 2615,8 g prontos;
          // ingrediente per capita bruto 500 g na base → escala 100/2615,8
          ingredientes: [{ alimentoId: 'laranja', perCapitaBruto: 500, perCapitaLiquido: 400 }],
        },
      ],
      demandas: [{ erudioUnidadeEnsinoId: 501, erudioEtapaId: 101, nomeEscola: 'Escola A', alunosAtivos: 10 }],
      itensContrato: [
        { alimentoId: 'laranja', unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4, ativo: true },
      ],
      empenhos: [
        {
          id: 'emp',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE00421',
          ativo: true,
          itensEmpenhados: [{ alimentoId: 'laranja', qtdEmpenhada: 100, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4 }],
        },
      ],
      especiais: [],
    });
    const resultado = calcularRomaneio(dados);
    const item = resultado.consolidado.find((i) => i.alimentoId === 'laranja');
    // por aluno: 500 g × (100/2615,8) = 19,115 g → ×10 alunos = 191,15 g = 0,19 kg
    expect(item?.quantidadeCalculada).toBeCloseTo(0.19, 2);
  });

  it('sem porcaoServidaGramas usa a receita-base inteira (escala 1)', () => {
    const dados = entrada({
      datasSelecionadas: ['2026-11-02'],
      dias: [
        {
          data: '2026-11-02',
          erudioEtapaId: 101,
          tipoDia: 'LETIVO',
          refeicoes: [
            {
              itens: [{ operador: null, ativoParaCompra: true, fichaTecnicaId: 'ft', porcaoServidaGramas: undefined }],
            },
          ],
        },
      ],
      fichas: [
        {
          id: 'ft',
          rendimentoTotalGramas: 2615.8,
          ingredientes: [{ alimentoId: 'laranja', perCapitaBruto: 150 }],
        },
      ],
      demandas: [{ erudioUnidadeEnsinoId: 501, erudioEtapaId: 101, nomeEscola: 'Escola A', alunosAtivos: 10 }],
      itensContrato: [
        { alimentoId: 'laranja', unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4, ativo: true },
      ],
      empenhos: [
        {
          id: 'emp',
          contratoHortiId: 'ct',
          numeroEmpenho: '2026NE00421',
          ativo: true,
          itensEmpenhados: [{ alimentoId: 'laranja', qtdEmpenhada: 100, unidadeMedida: UnidadeMedida.KG, valorUnitario: 3.4 }],
        },
      ],
      especiais: [],
    });
    const resultado = calcularRomaneio(dados);
    const item = resultado.consolidado.find((i) => i.alimentoId === 'laranja');
    // escala 1: 10 × 150 g = 1,5 kg
    expect(item?.quantidadeCalculada).toBe(1.5);
  });
});

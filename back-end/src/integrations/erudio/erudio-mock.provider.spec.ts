import { ErudioMockProvider } from './erudio-mock.provider.js';

describe('ErudioMockProvider', () => {
  const provider = new ErudioMockProvider();

  it('traduz tipo_id do CEI e da escola básica sem renomear a etapa 1', async () => {
    const unidades = await provider.listarUnidades();
    const adelia = unidades.find((unidade) => unidade.erudioUnidadeEnsinoId === 16147);
    const anibal = unidades.find((unidade) => unidade.erudioUnidadeEnsinoId === 16141);

    expect(adelia).toMatchObject({ tipoId: 1, tipo: 'CEI', tipoErudio: 'CENTRO DE EDUCAÇÃO INFANTIL' });
    expect(anibal).toMatchObject({ tipoId: 4, tipo: 'ESCOLA_BASICA' });

    const etapas = await provider.listarEtapas();
    expect(etapas.find((etapa) => etapa.erudioEtapaId === 1)).toMatchObject({
      nome: '1º Ano',
      faixaFnde: 'FUNDAMENTAL_I',
    });
    expect(etapas.find((etapa) => etapa.erudioEtapaId === 20)).toMatchObject({
      nome: 'Berçário I',
      faixaFnde: 'EDUCACAO_INFANTIL',
    });
    expect(etapas.find((etapa) => etapa.erudioEtapaId === 6)?.faixaFnde).toBe('FUNDAMENTAL_II');
  });

  it('mantém a contagem real da Adélia e não devolve CRN', async () => {
    const contagem = await provider.listarContagemAlunos({ erudioUnidadeEnsinoId: 16147, erudioEtapaId: 20 });
    expect(contagem).toEqual([{ erudioUnidadeEnsinoId: 16147, nomeEscola: 'ADÉLIA RUSSI SILVA', erudioEtapaId: 20, erudioTurnoId: 4, totalAlunosAtivos: 22 }]);

    const usuarios = await provider.listarUsuarios({ grupo: 'NUTRICIONISTAS' });
    expect(usuarios.map((usuario) => usuario.erudioUsuarioId)).toEqual([124799, 114250, 124797]);
    expect(usuarios.every((usuario) => usuario.crn === null && usuario.perfil === 'NUTRICIONISTA')).toBe(true);
  });

  it('mapeia atividade administrativa da SME para reunião pedagógica do cardápio', async () => {
    const dias = await provider.listarCalendario({
      erudioUnidadeEnsinoId: 16147,
      de: '2026-01-01',
      ate: '2026-01-31',
    });

    expect(dias).toEqual([
      expect.objectContaining({
        instituicaoId: 16138,
        erudioUnidadeEnsinoId: null,
        data: '2026-01-28',
        ehDiaLetivo: false,
        tipoEvento: 'ATIVIDADE_ADMINISTRATIVA',
        tipoDiaCardapio: 'REUNIAO_PEDAGOGICA',
      }),
    ]);
  });
});

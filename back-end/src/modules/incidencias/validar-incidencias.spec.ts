import { TipoAlvoIncidencia } from '../../common/enums/index.js';
import { validarIncidencias } from './validar-incidencias.js';

const alimentos = [
  { id: 'laranja', nome: 'Laranja', gruposIncidenciaIds: ['frutas'] },
  { id: 'acucar', nome: 'Açúcar', gruposIncidenciaIds: ['doces'] },
];

const fichas = [
  {
    id: 'suco',
    nome: 'Suco',
    gruposIncidenciaIds: ['bebidas'],
    ingredientes: [{ alimentoId: 'laranja' }],
  },
  {
    id: 'doce',
    nome: 'Doce',
    gruposIncidenciaIds: ['doces'],
    ingredientes: [{ alimentoId: 'acucar' }],
  },
];

describe('validarIncidencias', () => {
  it('conta ficha, alimento e grupo sem duplicar tag na mesma oferta', () => {
    const resultado = validarIncidencias({
      alimentos,
      fichas,
      dias: [
        {
          numeroSemana: 1,
          tipoDia: 'LETIVO',
          refeicoes: [
            {
              itens: [{ operador: null, fichaTecnicaId: 'suco', ativoParaCompra: true }],
            },
            {
              itens: [
                { operador: null, fichaTecnicaId: 'doce', ativoParaCompra: true },
                { operador: 'OU', alimentoId: 'laranja', ativoParaCompra: false },
              ],
            },
          ],
        },
      ],
      regras: [
        {
          tipoAlvo: TipoAlvoIncidencia.FICHA_TECNICA,
          grupoIncidenciaId: null,
          fichaTecnicaId: 'suco',
          alimentoId: null,
          periodo: 'SEMANAL',
          frequenciaMinima: 1,
          frequenciaMaxima: null,
          origemRegra: 'LEI_PNAE',
          alvoNome: 'Suco',
        },
        {
          tipoAlvo: TipoAlvoIncidencia.GRUPO,
          grupoIncidenciaId: 'doces',
          fichaTecnicaId: null,
          alimentoId: null,
          periodo: 'SEMANAL',
          frequenciaMinima: null,
          frequenciaMaxima: 0,
          origemRegra: 'LEI_PNAE',
          alvoNome: 'Doces',
        },
        {
          tipoAlvo: TipoAlvoIncidencia.ALIMENTO,
          grupoIncidenciaId: null,
          fichaTecnicaId: null,
          alimentoId: 'laranja',
          periodo: 'SEMANAL',
          frequenciaMinima: 2,
          frequenciaMaxima: null,
          origemRegra: 'LEI_PNAE',
          alvoNome: 'Laranja',
        },
      ],
    });

    expect(resultado.valido).toBe(false);
    expect(resultado.revisao).toHaveLength(3);
    expect(resultado.revisao.find((linha) => linha.alvoNome === 'Suco')?.contagemSemanas[1]).toBe(1);
    expect(resultado.revisao.find((linha) => linha.alvoNome === 'Doces')?.statusSemanas[1]).toBe('PROIBIDO');
    expect(resultado.revisao.find((linha) => linha.alvoNome === 'Laranja')?.contagemSemanas[1]).toBe(1);
  });
});
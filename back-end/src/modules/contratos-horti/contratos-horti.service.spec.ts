import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { TipoEventoContrato, UnidadeMedida } from '../../common/enums/index.js';
import { Alimento } from '../alimentos/schemas/alimento.schema.js';
import { Empenho } from '../empenhos/schemas/empenho.schema.js';
import { ContratosHortiService } from './contratos-horti.service.js';
import { ContratoHortiHistorico } from './schemas/contrato-horti-historico.schema.js';
import { ContratoHorti } from './schemas/contrato-horti.schema.js';

const ALIMENTO_ID = '507f1f77bcf86cd799439011';
const CONTRATO_ID = '507f1f77bcf86cd799439012';

function execMock(valor: unknown) {
  return { exec: vi.fn().mockResolvedValue(valor) };
}

function montarServico(modelos: {
  contratoModel?: Record<string, unknown>;
  historicoModel?: Record<string, unknown>;
  alimentoModel?: Record<string, unknown>;
  empenhoModel?: Record<string, unknown>;
}): Promise<ContratosHortiService> {
  return Test.createTestingModule({
    providers: [
      ContratosHortiService,
      {
        provide: getModelToken(ContratoHorti.name),
        useValue: modelos.contratoModel ?? {},
      },
      {
        provide: getModelToken(ContratoHortiHistorico.name),
        useValue: modelos.historicoModel ?? {},
      },
      {
        provide: getModelToken(Alimento.name),
        useValue: modelos.alimentoModel ?? { countDocuments: vi.fn().mockReturnValue(execMock(1)) },
      },
      {
        provide: getModelToken(Empenho.name),
        useValue: modelos.empenhoModel ?? { find: vi.fn().mockReturnValue(execMock([])) },
      },
    ],
  })
    .compile()
    .then(module => module.get(ContratosHortiService));
}

function itemDto(overrides: Record<string, unknown> = {}) {
  return {
    alimentoId: ALIMENTO_ID,
    unidadeMedida: UnidadeMedida.KG,
    qtdTotalLicitada: 10,
    valorUnitario: 4,
    diasSemanaEntrega: [1],
    ...overrides,
  };
}

function dtoContrato(itens: unknown[] = []) {
  return {
    numeroContrato: '001/2026',
    fornecedorNome: 'Fornecedor Teste',
    fornecedorCnpj: '12345678000190',
    vigenciaInicio: new Date('2026-01-01'),
    vigenciaFim: new Date('2026-12-31'),
    itens,
  };
}

describe('ContratosHortiService', () => {
  it('reajusta o preço do item e grava o histórico com o valor anterior', async () => {
    const item = {
      alimentoId: { toString: () => ALIMENTO_ID },
      unidadeMedida: UnidadeMedida.KG,
      qtdTotalLicitada: 10,
      valorUnitario: 4,
      ativo: true,
    };
    const contrato = {
      _id: CONTRATO_ID,
      itens: [item],
      save: vi.fn().mockResolvedValue(undefined),
    };
    const historicoCreate = vi.fn().mockResolvedValue({});
    const module = await Test.createTestingModule({
      providers: [
        ContratosHortiService,
        {
          provide: getModelToken(ContratoHorti.name),
          useValue: { findById: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(contrato) }) },
        },
        { provide: getModelToken(ContratoHortiHistorico.name), useValue: { create: historicoCreate } },
        { provide: getModelToken(Alimento.name), useValue: {} },
        {
          provide: getModelToken(Empenho.name),
          useValue: { find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }) },
        },
      ],
    }).compile();

    const service = module.get(ContratosHortiService);
    await service.registrarAlteracaoItem(CONTRATO_ID, {
      tipoEvento: TipoEventoContrato.REAJUSTE_PRECO,
      numeroDocumento: 'Aditivo 1',
      dataVigencia: new Date('2026-04-01T00:00:00.000Z'),
      alimentoId: ALIMENTO_ID,
      motivo: 'Reajuste anual',
      autorUsuarioId: 'usuario-1',
      valorNovo: 6,
    });

    expect(item.valorUnitario).toBe(6);
    expect(contrato.save).toHaveBeenCalledOnce();
    expect(historicoCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        contratoHortiId: CONTRATO_ID,
        tipoEvento: TipoEventoContrato.REAJUSTE_PRECO,
        alimentoId: ALIMENTO_ID,
        unidadeMedida: UnidadeMedida.KG,
        valorAnterior: 4,
        valorNovo: 6,
        motivo: 'Reajuste anual',
        autorUsuarioId: 'usuario-1',
      }),
    );
  });

  describe('validação de gramasPorUnidade', () => {
    it.each([UnidadeMedida.UNIDADE, UnidadeMedida.MACO, UnidadeMedida.DUZIA])(
      'rejeita %s sem gramasPorUnidade positivo',
      async unidade => {
        const service = await montarServico({});
        await expect(
          service.create(dtoContrato([itemDto({ unidadeMedida: unidade })]) as never),
        ).rejects.toBeInstanceOf(BadRequestException);
        await expect(
          service.create(
            dtoContrato([itemDto({ unidadeMedida: unidade, gramasPorUnidade: 0 })]) as never,
          ),
        ).rejects.toBeInstanceOf(BadRequestException);
      },
    );

    it('aplica fallback de 1000 g para LITRO sem gramasPorUnidade', async () => {
      const create = vi.fn().mockResolvedValue({});
      const service = await montarServico({ contratoModel: { create } });
      await service.create(
        dtoContrato([itemDto({ unidadeMedida: UnidadeMedida.LITRO })]) as never,
      );
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          itens: [expect.objectContaining({ gramasPorUnidade: 1000 })],
        }),
      );
    });

    it('persiste gramasPorUnidade informado para LITRO', async () => {
      const create = vi.fn().mockResolvedValue({});
      const service = await montarServico({ contratoModel: { create } });
      await service.create(
        dtoContrato([
          itemDto({ unidadeMedida: UnidadeMedida.LITRO, gramasPorUnidade: 1200 }),
        ]) as never,
      );
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          itens: [expect.objectContaining({ gramasPorUnidade: 1200 })],
        }),
      );
    });
  });

  describe('saldos por item', () => {
    it('retorna qtdEmpenhada e saldoDisponivel somando empenhos ativos', async () => {
      const contrato = {
        _id: new Types.ObjectId(CONTRATO_ID),
        itens: [
          {
            alimentoId: new Types.ObjectId(ALIMENTO_ID),
            unidadeMedida: UnidadeMedida.KG,
            qtdTotalLicitada: 100,
            valorUnitario: 5,
            ativo: true,
          },
        ],
        toObject() {
          return {
            _id: this._id,
            itens: this.itens.map(item => ({ ...item })),
          };
        },
      };
      const empenhos = [
        {
          itensEmpenhados: [
            { alimentoId: new Types.ObjectId(ALIMENTO_ID), qtdEmpenhada: 30 },
            { alimentoId: new Types.ObjectId(ALIMENTO_ID), qtdEmpenhada: 20 },
          ],
        },
      ];
      const service = await montarServico({
        contratoModel: { findById: vi.fn().mockReturnValue(execMock(contrato)) },
        empenhoModel: { find: vi.fn().mockReturnValue(execMock(empenhos)) },
      });

      const resultado = (await service.findOneComSaldos(CONTRATO_ID)) as {
        itens: { qtdEmpenhada: number; saldoDisponivel: number }[];
      };

      expect(resultado.itens[0].qtdEmpenhada).toBe(50);
      expect(resultado.itens[0].saldoDisponivel).toBe(50);
    });
  });

  describe('trava de unidade em itens empenhados', () => {
    const contratoComItem = () => ({
      _id: new Types.ObjectId(CONTRATO_ID),
      itens: [
        {
          alimentoId: new Types.ObjectId(ALIMENTO_ID),
          unidadeMedida: UnidadeMedida.KG,
          qtdTotalLicitada: 100,
          valorUnitario: 5,
          gramasPorUnidade: null,
          diasSemanaEntrega: [1],
          ativo: true,
        },
      ],
      save: vi.fn().mockResolvedValue(undefined),
    });

    const empenhoAtivo = {
      itensEmpenhados: [
        {
          alimentoId: new Types.ObjectId(ALIMENTO_ID),
          unidadeMedida: UnidadeMedida.KG,
          gramasPorUnidade: null,
        },
      ],
    };

    it('rejeita mudança de unidadeMedida de item com empenho ativo', async () => {
      const service = await montarServico({
        contratoModel: { findById: vi.fn().mockReturnValue(execMock(contratoComItem())) },
        empenhoModel: { find: vi.fn().mockReturnValue(execMock([empenhoAtivo])) },
      });
      await expect(
        service.updateItens(CONTRATO_ID, {
          itens: [itemDto({ unidadeMedida: UnidadeMedida.UNIDADE, gramasPorUnidade: 500 })],
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejeita remoção de item com empenho ativo', async () => {
      const service = await montarServico({
        contratoModel: { findById: vi.fn().mockReturnValue(execMock(contratoComItem())) },
        empenhoModel: { find: vi.fn().mockReturnValue(execMock([empenhoAtivo])) },
      });
      await expect(
        service.updateItens(CONTRATO_ID, { itens: [] } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('permite alterar quantidade de item com empenho ativo mantendo a unidade', async () => {
      const contrato = contratoComItem();
      const service = await montarServico({
        contratoModel: { findById: vi.fn().mockReturnValue(execMock(contrato)) },
        empenhoModel: { find: vi.fn().mockReturnValue(execMock([empenhoAtivo])) },
      });
      await service.updateItens(CONTRATO_ID, {
        itens: [itemDto({ qtdTotalLicitada: 150 })],
      } as never);
      expect(contrato.itens[0].qtdTotalLicitada).toBe(150);
    });
  });
});

import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { UnidadeMedida } from '../../common/enums/index.js';
import { ContratoHorti } from '../contratos-horti/schemas/contrato-horti.schema.js';
import { ListaCompras } from '../listas-compras/schemas/lista-compras.schema.js';
import type { CreateEmpenhoDto } from './dto/create-empenho.dto.js';
import { EmpenhosService } from './empenhos.service.js';
import { Empenho } from './schemas/empenho.schema.js';

const ALIMENTO_ID = '507f1f77bcf86cd799439011';
const CONTRATO_ID = '507f1f77bcf86cd799439012';

function contratoHortifruti() {
  return {
    vigenciaInicio: new Date('2026-01-01T00:00:00.000Z'),
    vigenciaFim: new Date('2026-12-31T00:00:00.000Z'),
    itens: [
      {
        alimentoId: { toString: () => ALIMENTO_ID },
        unidadeMedida: UnidadeMedida.KG,
        qtdTotalLicitada: 100,
        ativo: true,
      },
    ],
  };
}

function empenhoDto(qtdEmpenhada: number, dataInicio = '2026-02-01T00:00:00.000Z'): CreateEmpenhoDto {
  return {
    contratoHortiId: CONTRATO_ID,
    numeroEmpenho: '2026NE0001',
    dataInicio: new Date(dataInicio),
    dataFim: new Date('2026-06-30T00:00:00.000Z'),
    itensEmpenhados: [
      {
        alimentoId: ALIMENTO_ID,
        qtdEmpenhada,
        unidadeMedida: UnidadeMedida.KG,
        valorUnitario: 4.5,
        previsaoMensal: [{ mes: 2, ano: 2026, qtdPrevista: qtdEmpenhada }],
      },
    ],
  };
}

describe('EmpenhosService', () => {
  function modulo(qtdJaEmpenhada: number) {
    const create = vi.fn().mockResolvedValue({ id: 'empenho-1' });
    return Test.createTestingModule({
      providers: [
        EmpenhosService,
        {
          provide: getModelToken(Empenho.name),
          useValue: {
            create,
            find: vi.fn().mockReturnValue({
              exec: vi.fn().mockResolvedValue([
                {
                  itensEmpenhados: [{ alimentoId: { toString: () => ALIMENTO_ID }, qtdEmpenhada: qtdJaEmpenhada }],
                },
              ]),
            }),
          },
        },
        {
          provide: getModelToken(ContratoHorti.name),
          useValue: { findById: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(contratoHortifruti()) }) },
        },
        {
          provide: getModelToken(ListaCompras.name),
          useValue: { find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }) },
        },
      ],
    })
      .compile()
      .then((module) => ({ service: module.get(EmpenhosService), create }));
  }

  it('bloqueia empenho com início anterior à vigência do contrato', async () => {
    const { service, create } = await modulo(0);
    await expect(service.create(empenhoDto(10, '2025-12-01T00:00:00.000Z'))).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('bloqueia quando a soma empenhada ultrapassa a quantidade licitada', async () => {
    const { service, create } = await modulo(80);
    await expect(service.create(empenhoDto(30))).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('permite empenho até o limite da quantidade licitada', async () => {
    const { service, create } = await modulo(80);
    await service.create(empenhoDto(20));
    expect(create).toHaveBeenCalledOnce();
  });

  it('informa o saldo ainda disponível para empenhar', async () => {
    const { service } = await modulo(80);
    await expect(service.saldoDisponivel(CONTRATO_ID)).resolves.toEqual([
      expect.objectContaining({
        alimentoId: ALIMENTO_ID,
        qtdTotalLicitada: 100,
        qtdEmpenhada: 80,
        qtdDisponivel: 20,
      }),
    ]);
  });

  it('rejeita unidadeMedida divergente da unidade licitada no contrato', async () => {
    const { service, create } = await modulo(0);
    const dto = empenhoDto(10);
    dto.itensEmpenhados[0]!.unidadeMedida = UnidadeMedida.MACO;
    await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('herda unidadeMedida e gramasPorUnidade do contrato quando omitidos', async () => {
    const contrato = contratoHortifruti();
    contrato.itens[0]!.gramasPorUnidade = 250;
    const create = vi.fn().mockResolvedValue({ id: 'empenho-1' });
    const module = await Test.createTestingModule({
      providers: [
        EmpenhosService,
        {
          provide: getModelToken(Empenho.name),
          useValue: {
            create,
            find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }),
          },
        },
        {
          provide: getModelToken(ContratoHorti.name),
          useValue: { findById: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(contrato) }) },
        },
        {
          provide: getModelToken(ListaCompras.name),
          useValue: { find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }) },
        },
      ],
    }).compile();
    const service = module.get(EmpenhosService);
    const dto = empenhoDto(10);
    dto.itensEmpenhados[0]!.unidadeMedida = undefined;
    dto.itensEmpenhados[0]!.gramasPorUnidade = undefined;
    await service.create(dto);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        itensEmpenhados: [expect.objectContaining({ unidadeMedida: UnidadeMedida.KG, gramasPorUnidade: 250 })],
      }),
    );
  });

  it('rejeita gramasPorUnidade divergente do item licitado no contrato', async () => {
    const contrato = contratoHortifruti();
    contrato.itens[0]!.gramasPorUnidade = 250;
    const create = vi.fn().mockResolvedValue({ id: 'empenho-1' });
    const module = await Test.createTestingModule({
      providers: [
        EmpenhosService,
        {
          provide: getModelToken(Empenho.name),
          useValue: {
            create,
            find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }),
          },
        },
        {
          provide: getModelToken(ContratoHorti.name),
          useValue: { findById: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(contrato) }) },
        },
        {
          provide: getModelToken(ListaCompras.name),
          useValue: { find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }) },
        },
      ],
    }).compile();
    const service = module.get(EmpenhosService);
    const dto = empenhoDto(10);
    dto.itensEmpenhados[0]!.gramasPorUnidade = 300;
    await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('aceita gramasPorUnidade explícito igual ao do contrato', async () => {
    const contrato = contratoHortifruti();
    contrato.itens[0]!.gramasPorUnidade = 250;
    const create = vi.fn().mockResolvedValue({ id: 'empenho-1' });
    const module = await Test.createTestingModule({
      providers: [
        EmpenhosService,
        {
          provide: getModelToken(Empenho.name),
          useValue: {
            create,
            find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }),
          },
        },
        {
          provide: getModelToken(ContratoHorti.name),
          useValue: { findById: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(contrato) }) },
        },
        {
          provide: getModelToken(ListaCompras.name),
          useValue: { find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }) },
        },
      ],
    }).compile();
    const service = module.get(EmpenhosService);
    const dto = empenhoDto(10);
    dto.itensEmpenhados[0]!.gramasPorUnidade = 250;
    await service.create(dto);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        itensEmpenhados: [expect.objectContaining({ gramasPorUnidade: 250 })],
      }),
    );
  });

  it('saldo concorrente abate apenas listas confirmadas e ordena por vencimento', async () => {
    const itemEmpenhado = (qtd: number) => ({
      alimentoId: { toString: () => ALIMENTO_ID },
      qtdEmpenhada: qtd,
      unidadeMedida: UnidadeMedida.KG,
      valorUnitario: 4.5,
    });
    const module = await Test.createTestingModule({
      providers: [
        EmpenhosService,
        {
          provide: getModelToken(Empenho.name),
          useValue: {
            find: vi.fn().mockReturnValue({
              exec: vi.fn().mockResolvedValue([
                {
                  _id: { toString: () => 'emp-tardio' },
                  numeroEmpenho: '2026NE0002',
                  fonteRecurso: 'PNAE',
                  dataInicio: new Date('2026-02-01'),
                  dataFim: new Date('2026-08-31'),
                  itensEmpenhados: [itemEmpenhado(60)],
                },
                {
                  _id: { toString: () => 'emp-cedo' },
                  numeroEmpenho: '2026NE0001',
                  fonteRecurso: 'PNAE',
                  dataInicio: new Date('2026-02-01'),
                  dataFim: new Date('2026-05-31'),
                  itensEmpenhados: [itemEmpenhado(40)],
                },
              ]),
            }),
          },
        },
        {
          provide: getModelToken(ContratoHorti.name),
          useValue: { findById: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(contratoHortifruti()) }) },
        },
        {
          provide: getModelToken(ListaCompras.name),
          useValue: {
            find: vi.fn().mockReturnValue({
              exec: vi.fn().mockResolvedValue([
                {
                  alocacoes: [{ alimentoId: ALIMENTO_ID, rateios: [{ empenhoId: 'emp-tardio', quantidade: 25 }] }],
                  consolidado: [],
                },
              ]),
            }),
          },
        },
      ],
    }).compile();
    const service = module.get(EmpenhosService);
    const [saldo] = await service.saldoConcorrente(CONTRATO_ID);
    expect(saldo?.empenhos.map((atual) => atual.empenhoId)).toEqual(['emp-cedo', 'emp-tardio']);
    expect(saldo).toMatchObject({
      alimentoId: ALIMENTO_ID,
      qtdTotalLicitada: 100,
      qtdEmpenhada: 100,
      qtdAlocada: 25,
      qtdDisponivel: 0,
    });
    expect(saldo?.empenhos[0]).toMatchObject({ empenhoId: 'emp-cedo', saldoDisponivel: 40 });
    expect(saldo?.empenhos[1]).toMatchObject({ empenhoId: 'emp-tardio', qtdAlocada: 25, saldoDisponivel: 35 });
  });
});

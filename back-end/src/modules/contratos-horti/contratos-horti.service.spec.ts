import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { TipoEventoContrato, UnidadeMedida } from '../../common/enums/index.js';
import { Alimento } from '../alimentos/schemas/alimento.schema.js';
import { ContratosHortiService } from './contratos-horti.service.js';
import { ContratoHortiHistorico } from './schemas/contrato-horti-historico.schema.js';
import { ContratoHorti } from './schemas/contrato-horti.schema.js';

const ALIMENTO_ID = '507f1f77bcf86cd799439011';
const CONTRATO_ID = '507f1f77bcf86cd799439012';

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
});

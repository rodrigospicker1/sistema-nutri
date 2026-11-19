import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { CategoriaAlimento } from '../../common/enums/index.js';
import { AlimentosService } from './alimentos.service.js';
import { Alimento } from './schemas/alimento.schema.js';
import { GrupoIncidencia } from './schemas/grupo-incidencia.schema.js';

describe('AlimentosService', () => {
  it('filtra por nome, categoria e ativo', async () => {
    const exec = vi.fn().mockResolvedValue([]);
    const sort = vi.fn().mockReturnValue({ exec });
    const find = vi.fn().mockReturnValue({ sort });

    const module = await Test.createTestingModule({
      providers: [
        AlimentosService,
        { provide: getModelToken(Alimento.name), useValue: { find } },
        { provide: getModelToken(GrupoIncidencia.name), useValue: {} },
      ],
    }).compile();

    const service = module.get(AlimentosService);
    await service.findAll({
      nome: 'banana',
      categoria: CategoriaAlimento.FRUTA,
      ativo: true,
    });

    expect(find).toHaveBeenCalledWith({
      nome: { $regex: 'banana', $options: 'i' },
      categoria: CategoriaAlimento.FRUTA,
      ativo: true,
    });
    expect(sort).toHaveBeenCalledWith({ nome: 1 });
  });
});

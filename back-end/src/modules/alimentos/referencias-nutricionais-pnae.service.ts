import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReferenciaNutricionalPnaeDto } from './dto/create-referencia-nutricional-pnae.dto.js';
import { QueryReferenciaNutricionalPnaeDto } from './dto/query-referencia-nutricional-pnae.dto.js';
import { UpdateReferenciaNutricionalPnaeDto } from './dto/update-referencia-nutricional-pnae.dto.js';
import {
  ReferenciaNutricionalPnae,
  type ReferenciaNutricionalPnaeDocument,
} from './schemas/referencia-nutricional-pnae.schema.js';

const PARES_FAIXA = [
  ['kcalMin', 'kcalMax'],
  ['proteinaMin', 'proteinaMax'],
  ['lipidiosMin', 'lipidiosMax'],
  ['carboidratosMin', 'carboidratosMax'],
  ['calcioMin', 'calcioMax'],
  ['ferroMin', 'ferroMax'],
  ['vitaminaAMin', 'vitaminaAMax'],
  ['vitaminaCMin', 'vitaminaCMax'],
  ['sodioMin', 'sodioMax'],
] as const;

@Injectable()
export class ReferenciasNutricionaisPnaeService {
  constructor(
    @InjectModel(ReferenciaNutricionalPnae.name)
    private readonly referenciaModel: Model<ReferenciaNutricionalPnae>,
  ) {}

  async create(dto: CreateReferenciaNutricionalPnaeDto): Promise<ReferenciaNutricionalPnaeDocument> {
    this.assertFaixas(dto);
    return this.referenciaModel.create(dto);
  }

  async findAll(query: QueryReferenciaNutricionalPnaeDto): Promise<ReferenciaNutricionalPnaeDocument[]> {
    const filter: { ativo?: boolean } = {};
    if (query.ativo !== undefined) {
      filter.ativo = query.ativo;
    }
    return this.referenciaModel.find(filter).sort({ descricaoFaixa: 1 }).exec();
  }

  async findOne(id: string): Promise<ReferenciaNutricionalPnaeDocument> {
    const referencia = await this.referenciaModel.findById(id).exec();
    if (!referencia) {
      throw new NotFoundException('Referência nutricional do PNAE não encontrada');
    }
    return referencia;
  }

  async update(
    id: string,
    dto: UpdateReferenciaNutricionalPnaeDto,
  ): Promise<ReferenciaNutricionalPnaeDocument> {
    const atual = await this.findOne(id);
    this.assertFaixas(Object.assign(atual.toObject(), dto));
    const referencia = await this.referenciaModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!referencia) {
      throw new NotFoundException('Referência nutricional do PNAE não encontrada');
    }
    return referencia;
  }

  async remove(id: string): Promise<void> {
    const referencia = await this.referenciaModel.findByIdAndDelete(id).exec();
    if (!referencia) {
      throw new NotFoundException('Referência nutricional do PNAE não encontrada');
    }
  }

  private assertFaixas(
    dto: Partial<Record<(typeof PARES_FAIXA)[number][0] | (typeof PARES_FAIXA)[number][1], number>>,
  ): void {
    for (const [minKey, maxKey] of PARES_FAIXA) {
      const minimo = dto[minKey];
      const maximo = dto[maxKey];
      if (minimo !== undefined && maximo !== undefined && minimo > maximo) {
        throw new BadRequestException(`${minKey} não pode ser maior que ${maxKey}`);
      }
    }
  }
}

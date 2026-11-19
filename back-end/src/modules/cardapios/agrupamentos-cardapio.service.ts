import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAgrupamentoCardapioDto } from './dto/create-agrupamento-cardapio.dto.js';
import { AgrupamentoCardapio, type AgrupamentoCardapioDocument } from './schemas/agrupamento-cardapio.schema.js';

@Injectable()
export class AgrupamentosCardapioService {
  constructor(
    @InjectModel(AgrupamentoCardapio.name) private readonly agrupamentoModel: Model<AgrupamentoCardapio>,
  ) {}

  findAll(): Promise<AgrupamentoCardapioDocument[]> {
    return this.agrupamentoModel.find().sort({ nome: 1 }).exec();
  }

  async findOne(id: string): Promise<AgrupamentoCardapioDocument> {
    const agrupamento = await this.agrupamentoModel.findById(id).exec();
    if (!agrupamento) throw new NotFoundException('Agrupamento de cardápio não encontrado');
    return agrupamento;
  }

  async create(dto: CreateAgrupamentoCardapioDto): Promise<AgrupamentoCardapioDocument> {
    const etapas = [...new Set(dto.erudioEtapaIds)];
    return this.agrupamentoModel.create({
      nome: dto.nome.trim(),
      sigla: (dto.sigla?.trim() || dto.nome.trim().slice(0, 12)).toUpperCase(),
      erudioEtapaIds: etapas,
      ativo: dto.ativo !== false,
    });
  }
}

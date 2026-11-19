import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgrupamentosCardapioController } from './agrupamentos-cardapio.controller.js';
import { AgrupamentosCardapioService } from './agrupamentos-cardapio.service.js';
import { CardapiosController } from './cardapios.controller.js';
import { CardapiosService } from './cardapios.service.js';
import { AgrupamentoCardapio, AgrupamentoCardapioSchema } from './schemas/agrupamento-cardapio.schema.js';
import { Cardapio, CardapioSchema } from './schemas/cardapio.schema.js';
import { ContratoHorti, ContratoHortiSchema } from '../contratos-horti/schemas/contrato-horti.schema.js';
import { Empenho, EmpenhoSchema } from '../empenhos/schemas/empenho.schema.js';
import { ListaCompras, ListaComprasSchema } from '../listas-compras/schemas/lista-compras.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cardapio.name, schema: CardapioSchema },
      { name: AgrupamentoCardapio.name, schema: AgrupamentoCardapioSchema },
      { name: ContratoHorti.name, schema: ContratoHortiSchema },
      { name: Empenho.name, schema: EmpenhoSchema },
      { name: ListaCompras.name, schema: ListaComprasSchema },
    ]),
  ],
  controllers: [CardapiosController, AgrupamentosCardapioController],
  providers: [CardapiosService, AgrupamentosCardapioService],
  exports: [MongooseModule],
})
export class CardapiosModule {}

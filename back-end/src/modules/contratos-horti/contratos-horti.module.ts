import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlimentosModule } from '../alimentos/alimentos.module.js';
import { ContratosHortiController } from './contratos-horti.controller.js';
import { ContratosHortiService } from './contratos-horti.service.js';
import { ContratoHortiHistorico, ContratoHortiHistoricoSchema } from './schemas/contrato-horti-historico.schema.js';
import { ContratoHorti, ContratoHortiSchema } from './schemas/contrato-horti.schema.js';
import { Empenho, EmpenhoSchema } from '../empenhos/schemas/empenho.schema.js';

@Module({
  imports: [
    AlimentosModule,
    MongooseModule.forFeature([
      { name: ContratoHorti.name, schema: ContratoHortiSchema },
      { name: ContratoHortiHistorico.name, schema: ContratoHortiHistoricoSchema },
      { name: Empenho.name, schema: EmpenhoSchema },
    ]),
  ],
  controllers: [ContratosHortiController],
  providers: [ContratosHortiService],
  exports: [MongooseModule, ContratosHortiService],
})
export class ContratosHortiModule {}

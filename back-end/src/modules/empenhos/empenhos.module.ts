import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContratosHortiModule } from '../contratos-horti/contratos-horti.module.js';
import { EmpenhosController } from './empenhos.controller.js';
import { EmpenhosService } from './empenhos.service.js';
import { Empenho, EmpenhoSchema } from './schemas/empenho.schema.js';

@Module({
  imports: [ContratosHortiModule, MongooseModule.forFeature([{ name: Empenho.name, schema: EmpenhoSchema }])],
  controllers: [EmpenhosController],
  providers: [EmpenhosService],
  exports: [EmpenhosService],
})
export class EmpenhosModule {}

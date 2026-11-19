import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlimentosController } from './alimentos.controller.js';
import { AlimentosService } from './alimentos.service.js';
import { GruposIncidenciaController } from './grupos-incidencia.controller.js';
import { GruposIncidenciaService } from './grupos-incidencia.service.js';
import { ReferenciasNutricionaisPnaeController } from './referencias-nutricionais-pnae.controller.js';
import { ReferenciasNutricionaisPnaeService } from './referencias-nutricionais-pnae.service.js';
import { Alimento, AlimentoSchema } from './schemas/alimento.schema.js';
import { GrupoIncidencia, GrupoIncidenciaSchema } from './schemas/grupo-incidencia.schema.js';
import {
  ReferenciaNutricionalPnae,
  ReferenciaNutricionalPnaeSchema,
} from './schemas/referencia-nutricional-pnae.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Alimento.name, schema: AlimentoSchema },
      { name: GrupoIncidencia.name, schema: GrupoIncidenciaSchema },
      { name: ReferenciaNutricionalPnae.name, schema: ReferenciaNutricionalPnaeSchema },
    ]),
  ],
  controllers: [AlimentosController, GruposIncidenciaController, ReferenciasNutricionaisPnaeController],
  providers: [AlimentosService, GruposIncidenciaService, ReferenciasNutricionaisPnaeService],
  exports: [MongooseModule, AlimentosService, GruposIncidenciaService, ReferenciasNutricionaisPnaeService],
})
export class AlimentosModule {}

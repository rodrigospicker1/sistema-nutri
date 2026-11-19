import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlimentosModule } from '../alimentos/alimentos.module.js';
import { FichasTecnicasController } from './fichas-tecnicas.controller.js';
import { FichasTecnicasService } from './fichas-tecnicas.service.js';
import { FichaTecnica, FichaTecnicaSchema } from './schemas/ficha-tecnica.schema.js';

@Module({
  imports: [
    AlimentosModule,
    MongooseModule.forFeature([{ name: FichaTecnica.name, schema: FichaTecnicaSchema }]),
  ],
  controllers: [FichasTecnicasController],
  providers: [FichasTecnicasService],
  exports: [MongooseModule, FichasTecnicasService],
})
export class FichasTecnicasModule {}
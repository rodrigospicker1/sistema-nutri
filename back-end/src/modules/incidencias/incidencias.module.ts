import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Alimento, AlimentoSchema } from '../alimentos/schemas/alimento.schema.js';
import { GrupoIncidencia, GrupoIncidenciaSchema } from '../alimentos/schemas/grupo-incidencia.schema.js';
import { FichaTecnica, FichaTecnicaSchema } from '../fichas-tecnicas/schemas/ficha-tecnica.schema.js';
import { CardapioLeitura, CardapioLeituraSchema } from '../listas-compras/schemas/cardapio-leitura.schema.js';
import { IncidenciasRegrasController } from './incidencias-regras.controller.js';
import { IncidenciasRegrasService } from './incidencias-regras.service.js';
import { IncidenciaRegra, IncidenciaRegraSchema } from './schemas/incidencia-regra.schema.js';
import { ValidarCardapioIncidenciaController } from './validar-cardapio.controller.js';
import { ValidarCardapioIncidenciaService } from './validar-cardapio.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IncidenciaRegra.name, schema: IncidenciaRegraSchema },
      { name: GrupoIncidencia.name, schema: GrupoIncidenciaSchema },
      { name: Alimento.name, schema: AlimentoSchema },
      { name: FichaTecnica.name, schema: FichaTecnicaSchema },
      { name: CardapioLeitura.name, schema: CardapioLeituraSchema },
    ]),
  ],
  controllers: [IncidenciasRegrasController, ValidarCardapioIncidenciaController],
  providers: [IncidenciasRegrasService, ValidarCardapioIncidenciaService],
})
export class IncidenciasModule {}
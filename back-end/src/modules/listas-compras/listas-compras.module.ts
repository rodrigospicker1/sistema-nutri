import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlimentacaoEspecialModule } from '../alimentacao-especial/alimentacao-especial.module.js';
import { AlimentosModule } from '../alimentos/alimentos.module.js';
import { ContratosHortiModule } from '../contratos-horti/contratos-horti.module.js';
import { ErudioAdapterService } from '../erudio/erudio-adapter.service.js';
import { Empenho, EmpenhoSchema } from '../empenhos/schemas/empenho.schema.js';
import { ListasComprasController } from './listas-compras.controller.js';
import { ListasComprasService } from './listas-compras.service.js';
import { AlimentacaoEspecial, AlimentacaoEspecialSchema } from './schemas/alimentacao-especial.schema.js';
import { CardapioLeitura, CardapioLeituraSchema } from './schemas/cardapio-leitura.schema.js';
import { DemandaEscolar, DemandaEscolarSchema } from './schemas/demanda-escolar.schema.js';
import { FichaTecnica, FichaTecnicaSchema } from '../fichas-tecnicas/schemas/ficha-tecnica.schema.js';
import { ListaCompras, ListaComprasSchema } from './schemas/lista-compras.schema.js';
import { MatriculaEscolar, MatriculaEscolarSchema } from './schemas/matricula-escolar.schema.js';
import { ConfiguracoesModule } from '../configuracoes/configuracoes.module.js';
import { RegrasRefeicaoModule } from '../regras-refeicao/regras-refeicao.module.js';

@Module({
  imports: [
    AlimentosModule,
    AlimentacaoEspecialModule,
    ContratosHortiModule,
    RegrasRefeicaoModule,
    ConfiguracoesModule,
    MongooseModule.forFeature([
      { name: Empenho.name, schema: EmpenhoSchema },
      { name: CardapioLeitura.name, schema: CardapioLeituraSchema },
      { name: FichaTecnica.name, schema: FichaTecnicaSchema },
      { name: AlimentacaoEspecial.name, schema: AlimentacaoEspecialSchema },
      { name: DemandaEscolar.name, schema: DemandaEscolarSchema },
      { name: MatriculaEscolar.name, schema: MatriculaEscolarSchema },
      { name: ListaCompras.name, schema: ListaComprasSchema },
    ]),
  ],
  controllers: [ListasComprasController],
  providers: [ListasComprasService, ErudioAdapterService],
})
export class ListasComprasModule {}

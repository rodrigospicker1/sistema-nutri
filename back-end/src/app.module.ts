import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AlimentacaoEspecialModule } from './modules/alimentacao-especial/alimentacao-especial.module.js';
import { AlimentosModule } from './modules/alimentos/alimentos.module.js';
import { CardapiosModule } from './modules/cardapios/cardapios.module.js';
import { ConfiguracoesModule } from './modules/configuracoes/configuracoes.module.js';
import { ContratosHortiModule } from './modules/contratos-horti/contratos-horti.module.js';
import { EmpenhosModule } from './modules/empenhos/empenhos.module.js';
import { ErudioModule } from './integrations/erudio/erudio.module.js';
import { FichasTecnicasModule } from './modules/fichas-tecnicas/fichas-tecnicas.module.js';
import { IncidenciasModule } from './modules/incidencias/incidencias.module.js';
import { ListasComprasModule } from './modules/listas-compras/listas-compras.module.js';
import { RegrasRefeicaoModule } from './modules/regras-refeicao/regras-refeicao.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
      }),
    }),
    AlimentosModule,
    AlimentacaoEspecialModule,
    CardapiosModule,
    ConfiguracoesModule,
    ContratosHortiModule,
    EmpenhosModule,
    ErudioModule,
    FichasTecnicasModule,
    IncidenciasModule,
    ListasComprasModule,
    RegrasRefeicaoModule,
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'back-end',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

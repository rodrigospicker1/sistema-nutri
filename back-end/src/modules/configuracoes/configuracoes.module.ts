import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfiguracoesController } from './configuracoes.controller.js';
import { ConfiguracoesService } from './configuracoes.service.js';
import { ConfiguracaoGeral, ConfiguracaoGeralSchema } from './schemas/configuracao-geral.schema.js';
import { ConfiguracaoUnidadeEnsino, ConfiguracaoUnidadeEnsinoSchema } from './schemas/configuracao-unidade-ensino.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConfiguracaoUnidadeEnsino.name, schema: ConfiguracaoUnidadeEnsinoSchema },
      { name: ConfiguracaoGeral.name, schema: ConfiguracaoGeralSchema },
    ]),
  ],
  controllers: [ConfiguracoesController],
  providers: [ConfiguracoesService],
  exports: [ConfiguracoesService],
})
export class ConfiguracoesModule {}

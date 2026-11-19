import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CardapiosModule } from '../cardapios/cardapios.module.js';
import { AlimentacaoEspecial, AlimentacaoEspecialSchema } from '../listas-compras/schemas/alimentacao-especial.schema.js';
import { AlimentacaoEspecialController } from './alimentacao-especial.controller.js';
import { AlimentacaoEspecialService } from './alimentacao-especial.service.js';
import { AdaptacaoCardapio, AdaptacaoCardapioSchema } from './schemas/adaptacao-cardapio.schema.js';
import { AdaptacaoOverride, AdaptacaoOverrideSchema } from './schemas/adaptacao-override.schema.js';
import { TipoRestricao, TipoRestricaoSchema } from './schemas/tipo-restricao.schema.js';

@Module({
  imports: [
    CardapiosModule,
    MongooseModule.forFeature([
      { name: TipoRestricao.name, schema: TipoRestricaoSchema },
      { name: AdaptacaoCardapio.name, schema: AdaptacaoCardapioSchema },
      { name: AdaptacaoOverride.name, schema: AdaptacaoOverrideSchema },
      { name: AlimentacaoEspecial.name, schema: AlimentacaoEspecialSchema },
    ]),
  ],
  controllers: [AlimentacaoEspecialController],
  providers: [AlimentacaoEspecialService],
  exports: [AlimentacaoEspecialService],
})
export class AlimentacaoEspecialModule {}

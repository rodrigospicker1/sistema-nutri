import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegrasRefeicaoController } from './regras-refeicao.controller.js';
import { RegrasRefeicaoService } from './regras-refeicao.service.js';
import { RegraRefeicaoTurno, RegraRefeicaoTurnoSchema } from './schemas/regra-refeicao-turno.schema.js';
import { TipoRefeicao, TipoRefeicaoSchema } from './schemas/tipo-refeicao.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegraRefeicaoTurno.name, schema: RegraRefeicaoTurnoSchema },
      { name: TipoRefeicao.name, schema: TipoRefeicaoSchema },
    ]),
  ],
  controllers: [RegrasRefeicaoController],
  providers: [RegrasRefeicaoService],
  exports: [RegrasRefeicaoService],
})
export class RegrasRefeicaoModule {}

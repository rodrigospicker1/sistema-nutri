import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalvarAlmocoContraturnoDto } from './dto/salvar-almoco-contraturno.dto.js';
import { ConfiguracoesService } from './configuracoes.service.js';

@ApiTags('Configurações')
@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly service: ConfiguracoesService) {}

  @Get('almoco-contraturno')
  @ApiOperation({ summary: 'Parâmetros da alocação do almoço em contraturno (unidades + desempate)' })
  obter() {
    return this.service.obterParametrosAlmocoContraturno();
  }

  @Put('almoco-contraturno')
  @ApiOperation({ summary: 'Salva a flag ofereceAlmocoContraturno por unidade e o desempate padrão' })
  salvar(@Body() dto: SalvarAlmocoContraturnoDto) {
    return this.service.salvarAlmocoContraturno(dto);
  }
}

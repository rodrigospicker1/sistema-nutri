import { Module } from '@nestjs/common';
import { ErudioMockProvider } from './erudio-mock.provider.js';
import { ERUDIO_PROVIDER } from './erudio.interfaces.js';
import { ErudioController } from './erudio.controller.js';

@Module({
  controllers: [ErudioController],
  providers: [ErudioMockProvider, { provide: ERUDIO_PROVIDER, useExisting: ErudioMockProvider }],
  exports: [ERUDIO_PROVIDER, ErudioMockProvider],
})
export class ErudioModule {}

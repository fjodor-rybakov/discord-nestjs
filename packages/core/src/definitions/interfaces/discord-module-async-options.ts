import { ModuleMetadata, Provider, Type } from '@nestjs/common';

import { DiscordModuleOption } from './discord-module-options';
import { DiscordOptionsFactory } from './discord-options-factory';

export interface DiscordModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<DiscordOptionsFactory>;
  useClass?: Type<DiscordOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<DiscordModuleOption> | DiscordModuleOption;
  /**
   * Add the necessary providers for dependency injection in your commands, pipe, filters etc.
   */
  extraProviders?: Provider[];
  inject?: any[];
}

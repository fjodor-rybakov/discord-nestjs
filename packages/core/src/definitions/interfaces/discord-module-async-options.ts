import { DiscordModuleOption } from './discord-module-options';
import { DiscordOptionsFactory } from './discord-options-factory';
import { ModuleMetadata, Type } from '@nestjs/common';

export interface DiscordModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<DiscordOptionsFactory>;
  useClass?: Type<DiscordOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<DiscordModuleOption> | DiscordModuleOption;
  inject?: any[];
}

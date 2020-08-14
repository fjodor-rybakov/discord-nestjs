import { ModuleMetadata, Type } from '@nestjs/common';
import { DiscordOptionsFactory } from './discord-options-factory';
import { DiscordModuleOption } from './discord-module-option';

export interface DiscordModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<DiscordOptionsFactory>;
  useClass?: Type<DiscordOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<DiscordModuleOption> | DiscordModuleOption;
  inject?: any[];
}

import { ModuleMetadata, Type } from '@nestjs/common';
import { Client } from 'discord.js';

import { DiscordModuleOption } from './discord-module-options';
import { DiscordOptionsFactory } from './discord-options-factory';

export type SetupClientFactory = (client: Client) => Promise<void> | void;

export interface DiscordModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<DiscordOptionsFactory>;
  useClass?: Type<DiscordOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<DiscordModuleOption> | DiscordModuleOption;
  setupClientFactory?: SetupClientFactory;
  inject?: any[];
}

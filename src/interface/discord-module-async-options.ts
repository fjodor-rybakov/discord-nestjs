import { ModuleMetadata, Type } from '@nestjs/common';
import { DiscordOptionsFactory } from './discord-options-factory';
import { Client } from 'discord.js';

export interface DiscordModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<DiscordOptionsFactory>;
  useClass?: Type<DiscordOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<Client> | Client;
  inject?: any[];
}

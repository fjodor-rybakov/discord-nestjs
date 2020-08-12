import { Client } from 'discord.js';
import { DiscordModuleOption } from './discord-module-option';

export interface DiscordResolve {
  resolve(
    instance: Record<string, any>,
    methodName: string,
    discordClient: Client,
    discordOptions?: DiscordModuleOption
  ): void;
}


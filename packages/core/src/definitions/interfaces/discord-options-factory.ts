import { DiscordModuleOption } from './discord-module-options';

export interface DiscordOptionsFactory {
  createDiscordOptions(): Promise<DiscordModuleOption> | DiscordModuleOption;
}

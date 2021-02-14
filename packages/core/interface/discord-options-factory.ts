import { DiscordModuleOption } from './discord-module-option';

export interface DiscordOptionsFactory {
  createDiscordOptions(): Promise<DiscordModuleOption> | DiscordModuleOption;
}

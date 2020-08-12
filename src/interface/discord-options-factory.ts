import { DiscordModuleOption } from './discord-module-option';

export interface DiscordOptionsFactory {
  createTelegramOptions(): Promise<DiscordModuleOption> | DiscordModuleOption;
}

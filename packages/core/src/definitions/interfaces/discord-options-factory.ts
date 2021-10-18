import { DiscordModuleOption } from './discord-module-options';

/**
 * Create class-based Discord module options
 */
export interface DiscordOptionsFactory {
  createDiscordOptions(): Promise<DiscordModuleOption> | DiscordModuleOption;
}

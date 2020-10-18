import { ClientOptions } from 'discord.js';
import { DiscordModuleChannelOptions } from './discord-module-channel-options';

export interface DiscordModuleOption extends ClientOptions {
  /**
   * Authorization token
   */
  token: string;

  /**
   * Start prefix for command
   */
  commandPrefix: string;

  /**
   * List of guild identifiers with which the bot will work
   */
  allowGuilds?: string[];

  /**
   * List of guilds identifiers with which the bot will not work
   */
  denyGuilds?: string[];

  /**
   * List of channel identifiers with which the bot will work
   */
  allowChannels?: DiscordModuleChannelOptions[];
}

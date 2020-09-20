import { ClientOptions } from 'discord.js';

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
}

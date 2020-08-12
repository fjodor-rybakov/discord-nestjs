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
}

import { ClientEvents } from 'discord.js';

/**
 * Base middleware interface
 */
export interface DiscordMiddleware {
  use(
    event: keyof ClientEvents,
    context: ClientEvents[keyof ClientEvents],
  ): Promise<void> | void;
}

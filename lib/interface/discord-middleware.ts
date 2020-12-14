import { ClientEvents } from 'discord.js';

/**
 * Base middleware interface
 */
export interface DiscordMiddleware<T = any> {
  use(
    event: keyof ClientEvents,
    context: T[],
  ): Promise<void> | void;
}

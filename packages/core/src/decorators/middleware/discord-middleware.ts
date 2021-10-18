import { ClientEvents } from 'discord.js';

/**
 * Middleware interface
 *
 * Middleware should be implemented on its basis
 */
export interface DiscordMiddleware<T = any> {
  use(event: keyof ClientEvents, context: T[]): Promise<void> | void;
}

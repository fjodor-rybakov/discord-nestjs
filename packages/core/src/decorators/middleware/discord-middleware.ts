import { ClientEvents } from 'discord.js';

/**
 * Middleware interface
 *
 * Middleware should be implemented on its basis
 */
export interface DiscordMiddleware<TEvent extends keyof ClientEvents = any> {
  use(event: TEvent, context: ClientEvents[TEvent]): Promise<void> | void;
}

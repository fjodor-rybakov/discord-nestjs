import { ClientEvents } from 'discord.js';

/**
 * Guard interface
 *
 * Guards should be implemented on its basis
 */
export interface DiscordGuard<T = any> {
  canActive(
    event: keyof ClientEvents,
    context: T[],
  ): boolean | Promise<boolean>;
}

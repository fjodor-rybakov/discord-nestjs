import { ClientEvents } from 'discord.js';

/**
 * Guard interface
 *
 * Guards should be implemented on its basis
 */
export interface DiscordGuard<TEvent extends keyof ClientEvents = any> {
  canActive(
    event: TEvent,
    context: ClientEvents[TEvent],
  ): boolean | Promise<boolean>;
}

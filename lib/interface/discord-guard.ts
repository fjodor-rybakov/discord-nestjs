import { ClientEvents } from 'discord.js';

/**
 * Base interceptor interface
 */
export interface DiscordGuard<T = any> {
  canActive(event: keyof ClientEvents, context: T): boolean | Promise<boolean>;
}

import { ClientEvents } from 'discord.js';

/**
 * Base pipe interface
 */
export interface DiscordPipeTransform<T = any> {
  transform(event: keyof ClientEvents, context: T): any | Promise<any>;
}

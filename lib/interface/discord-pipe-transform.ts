import { ClientEvents } from 'discord.js';

/**
 * Base pipe interface
 */
export interface DiscordPipeTransform<T = any, D = any> {
  transform(
    event: keyof ClientEvents,
    context: T,
    content?: D,
  ): any | Promise<any>;
}

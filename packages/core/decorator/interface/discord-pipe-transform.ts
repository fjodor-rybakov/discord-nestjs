import { ClientEvents } from 'discord.js';
import { ConstructorType } from '../../util/type/constructor-type';

/**
 * Base pipe interface
 */
export interface DiscordPipeTransform<T = any, D = any> {
  transform(
    event: keyof ClientEvents,
    context: T,
    content?: D,
    type?: ConstructorType<D>
  ): any | Promise<any>;
}

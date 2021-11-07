import { Interaction } from 'discord.js';

import { EventType } from '../../definitions/types/event.type';
import { DiscordArgumentMetadata } from './discord-argument-metadata';

/**
 * Base pipe interface
 *
 * Pipes should be implemented on its basis
 */
export interface DiscordPipeTransform<
  TValue = any,
  TReturn = any,
  TEvent extends EventType = any,
  TInteraction extends Interaction = any,
> {
  transform(
    value: TValue,
    metadata: DiscordArgumentMetadata<TEvent, TInteraction>,
  ): TReturn | Promise<TReturn>;
}

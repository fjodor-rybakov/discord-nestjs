import { Interaction } from 'discord.js';

import { EventType } from '../../definitions/types/event.type';
import { DiscordArgumentMetadata } from '../pipe/discord-argument-metadata';

/**
 * Exception filter interface
 *
 * Filters should be implemented on its basis
 */
export interface DiscordExceptionFilter<
  TException = any,
  TEvent extends EventType = EventType,
  TInteraction extends Interaction = any,
> {
  catch(
    exception: TException,
    metadata: DiscordArgumentMetadata<TEvent, TInteraction>,
  ): Promise<void> | void;
}

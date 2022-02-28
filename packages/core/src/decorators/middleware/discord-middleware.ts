import { Interaction } from 'discord.js';

import { EventArgs, EventType } from '../../definitions/types/event.type';

/**
 * Middleware interface
 *
 * Middleware should be implemented on its basis
 */
export interface DiscordMiddleware<
  TEvent extends EventType = any,
  TInteraction extends Interaction = any,
> {
  use(
    event: TEvent,
    eventArgs: EventArgs<TEvent, TInteraction>,
  ): Promise<void> | void;
}

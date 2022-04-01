import { Interaction } from 'discord.js';

import { EventArgs, EventType } from '../../definitions/types/event.type';

/**
 * Guard interface
 *
 * Guards should be implemented on its basis
 */
export interface DiscordGuard<
  TEvent extends EventType = EventType,
  TInteraction extends Interaction = any,
> {
  canActive(
    event: TEvent,
    eventArgs: EventArgs<TEvent, TInteraction>,
  ): boolean | Promise<boolean>;
}

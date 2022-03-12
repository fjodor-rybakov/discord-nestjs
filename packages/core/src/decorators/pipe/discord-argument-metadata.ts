import { Type } from '@nestjs/common';
import { Interaction } from 'discord.js';

import { EventArgs, EventType } from '../../definitions/types/event.type';
import { CommandNode } from '../../definitions/types/tree/command-node';

/**
 * Discord argument metadata
 */
export interface DiscordArgumentMetadata<
  TEvent extends EventType = any,
  TInteraction extends Interaction = any,
> {
  /**
   * Event name
   */
  event: TEvent;

  /**
   * Arguments from current event
   */
  eventArgs: EventArgs<TEvent, TInteraction>;

  /**
   * DTO instance type
   */
  metatype: Type;

  /**
   * Slash command node
   */
  commandNode: CommandNode;
}

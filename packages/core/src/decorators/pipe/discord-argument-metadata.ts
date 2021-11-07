import { Type } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

import { CommandNode } from '../../definitions/types/tree/command-node';

/**
 * Discord argument metadata
 */
export interface DiscordArgumentMetadata<
  TEvent extends keyof ClientEvents = any,
> {
  event: TEvent;

  eventArgs: ClientEvents[TEvent];

  metatype: Type;

  commandNode: CommandNode;
}

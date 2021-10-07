import { Type } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

/**
 * Discord argument metadata
 */
export interface DiscordArgumentMetadata<
  TEvent extends keyof ClientEvents = any,
> {
  event: TEvent;

  context: ClientEvents[TEvent];

  metatype: Type;
}

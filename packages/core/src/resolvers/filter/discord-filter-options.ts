import { Type } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

type TEvent = keyof ClientEvents;

export interface DiscordFilterOptions<TException extends Error = any> {
  instance: unknown;
  methodName: string;
  event: TEvent;
  context: ClientEvents[TEvent];
  exception?: TException;
  metatype?: Type;
  commandNode?: Record<string, any>;
}

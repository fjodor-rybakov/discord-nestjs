import { ClientEvents } from 'discord.js';
import { Type } from '@nestjs/common';

type T = keyof ClientEvents;

export interface DiscordFilterOptions<TException extends Error = any> {
  instance: unknown;
  methodName: string;
  event: T;
  context: ClientEvents[T];
  exception?: TException;
  metatype: Type;
  commandNode: Record<string, any>;
}

import { Type } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

type TEvent = keyof ClientEvents;

export interface DiscordFilterOptions<TException extends Error = any> {
  instance: InstanceType<any>;
  methodName: string;
  event: TEvent;
  eventArgs: ClientEvents[TEvent];
  exception?: TException;
  metatype?: Type;
  commandNode?: Record<string, any>;
}

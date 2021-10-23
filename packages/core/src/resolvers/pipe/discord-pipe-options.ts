import { Type } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

type TEvent = keyof ClientEvents;

export interface DiscordPipeOptions {
  instance: unknown;
  methodName: string;
  event: TEvent;
  context: ClientEvents[TEvent];
  initValue?: unknown;
  metatype?: Type;
  commandNode?: Record<string, any>;
}

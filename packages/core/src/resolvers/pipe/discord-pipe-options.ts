import { Type } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

type T = keyof ClientEvents;

export interface DiscordPipeOptions {
  instance: unknown;
  methodName: string;
  event: T;
  context: ClientEvents[T];
  initValue?: unknown;
  metatype: Type;
  commandNode: Record<string, any>;
}

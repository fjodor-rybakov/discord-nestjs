import { ClientEvents } from 'discord.js';
import { Type } from '@nestjs/common';

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

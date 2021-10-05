import { ClientEvents } from 'discord.js';

type T = keyof ClientEvents;

export interface DiscordGuardOptions {
  instance: unknown;
  methodName: string;
  event: T;
  context: ClientEvents[T];
}

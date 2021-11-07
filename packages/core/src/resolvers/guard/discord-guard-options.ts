import { ClientEvents } from 'discord.js';

type TEvent = keyof ClientEvents;

export interface DiscordGuardOptions {
  instance: unknown;
  methodName: string;
  event: TEvent;
  eventArgs: ClientEvents[TEvent];
}

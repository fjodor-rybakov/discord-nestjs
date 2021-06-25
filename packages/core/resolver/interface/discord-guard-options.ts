import { ClientEvents } from 'discord.js';

export interface DiscordGuardOptions {
  instance: unknown;
  methodName: string;
  event: keyof ClientEvents;
  context: ClientEvents[keyof ClientEvents];
}

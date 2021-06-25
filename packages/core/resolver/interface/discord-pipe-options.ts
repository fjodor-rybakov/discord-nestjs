import { ClientEvents } from 'discord.js';

export interface DiscordPipeOptions {
  instance: unknown;
  methodName: string;
  event: keyof ClientEvents;
  context: ClientEvents[keyof ClientEvents];
  content?: unknown;
  type: any;
}

import { ClientEvents } from 'discord.js';

export interface ApplyPropertyOption {
  instance: unknown;
  methodName: string;
  context: ClientEvents[keyof ClientEvents];
  content?: string;
}
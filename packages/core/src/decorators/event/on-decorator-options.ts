import { ClientEvents } from 'discord.js';

export interface OnDecoratorOptions {
  event: keyof ClientEvents;
}

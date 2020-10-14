import { ClientEvents } from 'discord.js';

/**
 * On event options
 */
export interface OnDecoratorOptions {
  /**
   * Event type
   */
  event: keyof ClientEvents;
}

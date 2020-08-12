import { ClientEvents } from "discord.js";

export interface OnDecoratorOptions {
  /**
   * Event type
   */
  events: keyof ClientEvents
}

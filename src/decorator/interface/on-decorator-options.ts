import { ClientEvents } from "discord.js";

export interface OnDecoratorOptions {
  /**
   * Event type
   */
  event: keyof ClientEvents
}

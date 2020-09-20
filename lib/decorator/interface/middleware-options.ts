import { ClientEvents } from 'discord.js';

/**
 * Middleware options
 */
export interface MiddlewareOptions {
  /**
   * Take events
   */
  allowEvents?: Array<keyof ClientEvents>;

  /**
   * Skip events
   */
  denyEvents?: Array<keyof ClientEvents>;
}

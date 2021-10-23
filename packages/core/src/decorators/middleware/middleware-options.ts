import { InjectableOptions } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

/**
 * Middleware options
 */
export interface MiddlewareOptions extends InjectableOptions {
  /**
   * Take events
   */
  allowEvents?: Array<keyof ClientEvents>;

  /**
   * Skip events
   */
  denyEvents?: Array<keyof ClientEvents>;
}

import { ClientEvents } from 'discord.js';
import { InjectableOptions } from '@nestjs/common/decorators/core/injectable.decorator';

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

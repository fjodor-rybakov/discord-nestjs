import { InjectableOptions } from '@nestjs/common';

import { EventType } from '../../definitions/types/event.type';

/**
 * Middleware options
 */
export interface MiddlewareOptions extends InjectableOptions {
  /**
   * Take events
   */
  allowEvents?: Array<EventType>;

  /**
   * Skip events
   */
  denyEvents?: Array<EventType>;
}

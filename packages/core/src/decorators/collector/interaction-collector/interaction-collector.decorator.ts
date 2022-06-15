import { MessageComponentTypeResolvable } from 'discord.js';

import { DiscordInteractionCollectorOptions } from './interaction-collector-options';
import { INTERACTION_COLLECTOR_METADATA } from './interaction-collector.constant';

/**
 * Interaction collector decorator
 */
export function InteractionEventCollector<
  T extends MessageComponentTypeResolvable = 'ACTION_ROW',
>(options: DiscordInteractionCollectorOptions<T>): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(
      INTERACTION_COLLECTOR_METADATA,
      options,
      target.prototype,
    );

    return target;
  };
}

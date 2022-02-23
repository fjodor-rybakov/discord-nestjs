import { Interaction } from 'discord.js';

import { DiscordInteractionCollectorOptions } from './interaction-collector-options';
import { INTERACTION_COLLECTOR_METADATA } from './interaction-collector.constant';

/**
 * Interaction collector decorator
 */
export function InteractionEventCollector<TInteraction extends Interaction>(
  options: DiscordInteractionCollectorOptions<TInteraction>,
): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(
      INTERACTION_COLLECTOR_METADATA,
      options,
      target.prototype,
    );

    return target;
  };
}

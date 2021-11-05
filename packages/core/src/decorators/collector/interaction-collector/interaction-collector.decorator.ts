import { INTERACTION_COLLECTOR_METADATA } from './interaction-collector.constant';
import { Interaction, InteractionCollectorOptions } from 'discord.js';

/**
 * Interaction collector decorator
 */
export function InteractionCollector<TInteraction extends Interaction>(
  options: InteractionCollectorOptions<TInteraction>,
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

import { DiscordReactionCollectorOptions } from './reaction-collector-options';
import { REACTION_COLLECTOR_METADATA } from './reaction-collector.constant';

/**
 * Reaction collector decorator
 */
export function ReactionEventCollector(
  options?: DiscordReactionCollectorOptions,
): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(
      REACTION_COLLECTOR_METADATA,
      options ?? {},
      target.prototype,
    );

    return target;
  };
}

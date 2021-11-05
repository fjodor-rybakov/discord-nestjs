import { DiscordReactionCollectorOptions } from '../../../definitions/types/reaction-collector.type';
import { REACTION_COLLECTOR_METADATA } from './reaction-collector.constant';

/**
 * Reaction collector decorator
 */
export function ReactionCollector(
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

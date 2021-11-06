import { DiscordMessageCollectorOptions } from './message-collector-options';
import { MESSAGE_COLLECTOR_METADATA } from './message-collector.constant';

/**
 * Message collector decorator
 */
export function MessageCollector(
  options: DiscordMessageCollectorOptions,
): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(
      MESSAGE_COLLECTOR_METADATA,
      options,
      target.prototype,
    );

    return target;
  };
}

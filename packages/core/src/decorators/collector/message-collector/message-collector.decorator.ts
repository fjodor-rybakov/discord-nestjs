import { MESSAGE_COLLECTOR_METADATA } from './message-collector.constant';
import { MessageCollectorOptions } from 'discord.js';

/**
 * Message collector decorator
 */
export function MessageCollector(
  options: MessageCollectorOptions,
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

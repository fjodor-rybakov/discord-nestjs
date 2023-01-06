import { ChannelType } from 'discord.js';

import { CHANNEL_DECORATOR } from './channel.constant';

/**
 * Channel decorator
 *
 * Sets the list of channel types that can be selected
 */
export function Channel(types: ChannelType[]): PropertyDecorator {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(
      CHANNEL_DECORATOR,
      types,
      target.constructor,
      propertyKey,
    );
  };
}

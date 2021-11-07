import { ChannelTypes } from 'discord.js/typings/enums';

import { ExcludeEnum } from '../../../definitions/types/exclude-enum.type';
import { CHANNEL_DECORATOR } from './channel.constant';

/**
 * Channel decorator
 *
 * Sets the list of channel types that can be selected
 */
export function Channel(
  types: ExcludeEnum<typeof ChannelTypes, 'UNKNOWN'>[],
): PropertyDecorator {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(CHANNEL_DECORATOR, types, target, propertyKey);
  };
}

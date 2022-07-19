import { ApplicationCommandOptionChoiceData, ChannelType } from 'discord.js';

import { NonParamOptions } from '../../decorators/option/param/non-param-options';
import { NumericParamOptions } from '../../decorators/option/param/numeric-param-options';
import { StringParamOptions } from '../../decorators/option/param/string-param-options';

export interface OptionMetadata {
  [property: string]: {
    param: Omit<
      NumericParamOptions & StringParamOptions & NonParamOptions,
      'type'
    > & {
      type?: any; // TODO: should be ApplicationCommandOptionTypes
    };
    choice?: ApplicationCommandOptionChoiceData[];
    channelTypes?: ChannelType[];
  };
}

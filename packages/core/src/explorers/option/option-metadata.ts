import { ApplicationCommandOptionChoiceData } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';

import { NonParamOptions } from '../../decorators/option/param/non-param-options';
import { NumericParamOptions } from '../../decorators/option/param/numeric-param-options';
import { StringParamOptions } from '../../decorators/option/param/string-param-options';
import { ExcludeEnum } from '../../definitions/types/exclude-enum.type';

export interface OptionMetadata {
  [property: string]: {
    param: Omit<
      NumericParamOptions & StringParamOptions & NonParamOptions,
      'type'
    > & {
      type?: any; // TODO: should be ApplicationCommandOptionTypes
    };
    choice?: ApplicationCommandOptionChoiceData[];
    channelTypes?: ExcludeEnum<typeof ChannelTypes, 'UNKNOWN'>[];
  };
}

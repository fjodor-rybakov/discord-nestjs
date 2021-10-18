import { ExcludeEnum } from '../../definitions/types/exclude-enum.type';
import {
  ApplicationCommandOptionChoice,
  CommandOptionChannelResolvableType,
  CommandOptionChoiceResolvableType,
  CommandOptionNonChoiceResolvableType,
} from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';

export interface OptionMetadata {
  [property: string]: {
    arg: {
      description: string;
      name: string;
      required?: boolean;
      type?:
        | CommandOptionChoiceResolvableType
        | CommandOptionNonChoiceResolvableType
        | CommandOptionChannelResolvableType;
    };
    choice?: ApplicationCommandOptionChoice[];
    channelTypes?: ExcludeEnum<typeof ChannelTypes, 'UNKNOWN'>[];
  };
}

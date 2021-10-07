import {
  ApplicationCommandOptionChoice,
  CommandOptionChannelResolvableType,
  CommandOptionChoiceResolvableType,
  CommandOptionNonChoiceResolvableType,
} from 'discord.js';

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
  };
}

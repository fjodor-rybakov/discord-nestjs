import { ApplicationCommandOptionChoiceData } from 'discord.js';

export type ChoiceOptions =
  | Record<
      string,
      string | number | Omit<ApplicationCommandOptionChoiceData, 'name'>
    >
  | Map<
      string,
      string | number | Omit<ApplicationCommandOptionChoiceData, 'name'>
    >;

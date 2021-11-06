import { ReactionCollectorOptions } from 'discord.js';

export type DiscordReactionCollectorOptions = Omit<
  ReactionCollectorOptions,
  'filter'
>;

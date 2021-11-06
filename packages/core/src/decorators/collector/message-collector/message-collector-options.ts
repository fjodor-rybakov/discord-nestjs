import { MessageCollectorOptions } from 'discord.js';

export type DiscordMessageCollectorOptions = Omit<
  MessageCollectorOptions,
  'filter'
>;

import {
  MessageChannelCollectorOptionsParams,
  MessageComponentTypeResolvable,
} from 'discord.js';

export type DiscordInteractionCollectorOptions<
  T extends MessageComponentTypeResolvable = 'ACTION_ROW',
> = Omit<MessageChannelCollectorOptionsParams<T, true>, 'filter'>;

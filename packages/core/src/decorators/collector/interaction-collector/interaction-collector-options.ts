import {
  MessageChannelCollectorOptionsParams,
  MessageComponentType,
} from 'discord.js';

export type DiscordInteractionCollectorOptions<T extends MessageComponentType> =
  Omit<MessageChannelCollectorOptionsParams<T, true>, 'filter'>;

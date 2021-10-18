import {
  CommandInteraction,
  InteractionReplyOptions,
  MessagePayload,
} from 'discord.js';

export interface DiscordTransformedCommand<DTOType> {
  handler(
    dto: DTOType,
    interaction: CommandInteraction,
  ):
    | Promise<string | MessagePayload | InteractionReplyOptions>
    | string
    | MessagePayload
    | InteractionReplyOptions;
}

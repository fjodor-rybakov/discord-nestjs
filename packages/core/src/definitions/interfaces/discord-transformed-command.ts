import { InteractionReplyOptions, MessagePayload } from 'discord.js';

export interface DiscordTransformedCommand<DTOType> {
  handler(
    dto: DTOType,
  ):
    | Promise<string | MessagePayload | InteractionReplyOptions>
    | string
    | MessagePayload
    | InteractionReplyOptions;
}

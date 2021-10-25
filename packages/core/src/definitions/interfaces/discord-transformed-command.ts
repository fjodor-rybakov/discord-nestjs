import {
  CommandInteraction,
  InteractionReplyOptions,
  MessagePayload,
} from 'discord.js';

/**
 * Discord transformed command
 *
 * Slash command with DTO should be implemented on its basis
 */
export interface DiscordTransformedCommand<DTOType> {
  handler(
    dto: DTOType,
    interaction: CommandInteraction,
  ):
    | Promise<string | MessagePayload | InteractionReplyOptions | void>
    | string
    | MessagePayload
    | InteractionReplyOptions
    | void;
}

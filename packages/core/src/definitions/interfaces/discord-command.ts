import {
  CommandInteraction,
  InteractionReplyOptions,
  MessagePayload,
} from 'discord.js';

/**
 * Discord command
 *
 * Slash command should be implemented on its basis
 */
export interface DiscordCommand {
  handler(
    interaction: CommandInteraction,
  ):
    | Promise<string | MessagePayload | InteractionReplyOptions | void>
    | string
    | MessagePayload
    | InteractionReplyOptions
    | void;
}

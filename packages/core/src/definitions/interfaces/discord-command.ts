import {
  CommandInteraction,
  InteractionReplyOptions,
  MessagePayload,
} from 'discord.js';

export interface DiscordCommand {
  handler(
    interaction: CommandInteraction,
  ):
    | Promise<string | MessagePayload | InteractionReplyOptions>
    | string
    | MessagePayload
    | InteractionReplyOptions;
}

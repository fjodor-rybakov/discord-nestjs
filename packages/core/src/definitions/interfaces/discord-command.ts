import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  InteractionReplyOptions,
  MessagePayload,
  SelectMenuInteraction,
} from 'discord.js';

import { CommandExecutionContext } from './command-execution-context';

/**
 * Discord command
 *
 * Slash command should be implemented on its basis
 */
export interface DiscordCommand {
  handler(
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
    executionContext: CommandExecutionContext<
      ButtonInteraction | SelectMenuInteraction
    >,
  ):
    | Promise<string | MessagePayload | InteractionReplyOptions | void>
    | string
    | MessagePayload
    | InteractionReplyOptions
    | void;
}

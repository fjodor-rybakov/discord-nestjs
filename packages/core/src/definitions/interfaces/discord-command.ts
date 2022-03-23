import {
  CommandInteraction,
  ContextMenuInteraction,
  InteractionReplyOptions,
  MessagePayload,
} from 'discord.js';

import { CommandExecutionContext } from './command-execution-context';

/**
 * Discord command
 *
 * Slash command should be implemented on its basis
 */
export interface DiscordCommand {
  handler(
    interaction: CommandInteraction | ContextMenuInteraction,
    executionContext: CommandExecutionContext,
  ):
    | Promise<string | MessagePayload | InteractionReplyOptions | void>
    | string
    | MessagePayload
    | InteractionReplyOptions
    | void;
}

import { CommandExecutionContext } from './command-execution-context';
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
    executionContext: CommandExecutionContext,
  ):
    | Promise<string | MessagePayload | InteractionReplyOptions | void>
    | string
    | MessagePayload
    | InteractionReplyOptions
    | void;
}

import { InteractionReplyOptions, MessagePayload } from 'discord.js';

import { TransformedCommandExecutionContext } from './transformed-command-execution-context';

/**
 * Discord transformed command
 *
 * Slash command with DTO should be implemented on its basis
 */
export interface DiscordTransformedCommand<DTOType> {
  handler(
    dto: DTOType,
    executionContext: TransformedCommandExecutionContext,
  ):
    | Promise<string | MessagePayload | InteractionReplyOptions | void>
    | string
    | MessagePayload
    | InteractionReplyOptions
    | void;
}

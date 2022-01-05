import {
  ChatInputApplicationCommandData,
  Message,
  Snowflake,
} from 'discord.js';

export interface RegisterCommandOptions {
  /**
   * For which guild to register a slash command
   */
  forGuild?: Snowflake;

  /**
   * Based on what criteria will slash commands be registered
   */
  allowFactory?: (
    message: Message,
    commandList: ChatInputApplicationCommandData[],
  ) => boolean;

  /**
   * Remove commands before
   *
   * @default: false
   */
  removeCommandsBefore?: boolean;
}

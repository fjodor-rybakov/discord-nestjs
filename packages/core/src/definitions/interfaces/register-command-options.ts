import { ApplicationCommandData, Message, Snowflake } from 'discord.js';

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
    commandList: ApplicationCommandData[],
  ) => boolean;

  /**
   * Remove only missing commands
   *
   * @default: false
   */
  removeCommandsBefore?: boolean;
}

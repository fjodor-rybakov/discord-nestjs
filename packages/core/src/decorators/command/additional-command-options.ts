import { Snowflake } from 'discord.js';

export interface AdditionalCommandOptions {
  /**
   * For which guild to register a slash command
   *
   * This param override `forGuild` from module options
   */
  forGuild?: Snowflake;
}

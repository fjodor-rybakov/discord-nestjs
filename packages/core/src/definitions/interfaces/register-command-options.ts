import { Message, Snowflake } from 'discord.js';
import { Subject } from 'rxjs';

import { AppCommandData } from './app-command-data';

export interface RegisterCommandOptions {
  /**
   * For which guild to register a slash command
   */
  forGuild?: Snowflake;

  /**
   * Used in cases where it is necessary to register commands by event
   */
  trigger?: (commandList: AppCommandData[]) => Subject<any>;

  /**
   * Based on what criteria will slash commands be registered
   */
  allowFactory?: (message: Message, commandList: AppCommandData[]) => boolean;

  /**
   * Remove only missing commands
   *
   * @default: false
   */
  removeCommandsBefore?: boolean;
}

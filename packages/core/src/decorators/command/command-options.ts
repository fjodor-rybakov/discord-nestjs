import { ApplicationCommandType, LocalizationMap } from 'discord.js';

import { TInclude } from '../../definitions/types/include.type';
import { AdditionalCommandOptions } from './additional-command-options';
import { BaseCommandOptions } from './base-command-options';

/**
 * Describe base command options
 */
export interface CommandOptions
  extends BaseCommandOptions,
    AdditionalCommandOptions {
  /**
   * Command description (Must be a blank string for context menu commands)
   */
  description: string;

  /**
   * Include subgroups and subcommands
   */
  include?: TInclude[];

  /**
   * Localize description
   */
  descriptionLocalizations?: LocalizationMap;

  /**
   * Slash command type
   *
   * @default ChatInput
   */
  type?: ApplicationCommandType.ChatInput;
}

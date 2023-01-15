import { ApplicationCommandType } from 'discord.js';

import { AdditionalCommandOptions } from './additional-command-options';
import { BaseCommandOptions } from './base-command-options';

export interface UICommandOptions
  extends BaseCommandOptions,
    AdditionalCommandOptions {
  /**
   * Context Menu command Type
   *
   * @default ChatInput
   */
  type?: ApplicationCommandType.User | ApplicationCommandType.Message;
}

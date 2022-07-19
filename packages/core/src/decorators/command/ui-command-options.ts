import { ApplicationCommandType } from 'discord.js';

import { BaseCommandOptions } from './base-command-options';

export interface UICommandOptions extends BaseCommandOptions {
  /**
   * Context Menu command Type
   *
   * @default ChatInput
   */
  type?: ApplicationCommandType.User | ApplicationCommandType.Message;
}

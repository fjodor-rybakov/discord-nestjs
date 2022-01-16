import { ApplicationCommandTypes } from 'discord.js/typings/enums';

import { TInclude } from '../../definitions/types/include.type';

/**
 * Describe base command options
 */
export interface CommandOptions {
  /**
   * Command name
   */
  name: string;

  /**
   * Command description
   */
  description: string;

  /**
   * Include subgroups and subcommands
   */
  include?: TInclude[];

  /**
   * Set default permission
   */
  defaultPermission?: boolean;

  /**
   * Command Type (Slash or Context Menu)
   *
   * @default CHAT_INPUT
   */
  type?: ApplicationCommandTypes;
}

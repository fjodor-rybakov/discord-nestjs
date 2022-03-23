import { ApplicationCommandTypes } from 'discord.js/typings/enums';

export interface UICommandOptions {
  /**
   * Command name
   */
  name: string;

  /**
   * Set default permission
   */
  defaultPermission?: boolean;

  /**
   * Context Menu command Type
   *
   * @default CHAT_INPUT
   */
  type?: ApplicationCommandTypes.USER | ApplicationCommandTypes.MESSAGE;
}

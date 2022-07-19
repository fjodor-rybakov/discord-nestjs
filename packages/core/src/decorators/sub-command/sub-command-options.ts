import { LocalizationMap } from 'discord.js';

export interface SubCommandOptions {
  /**
   * Sub command name
   */
  name: string;

  /**
   * Sub command description
   */
  description: string;

  /**
   * Localize name
   */
  nameLocalizations?: LocalizationMap;

  /**
   * Localize description
   */
  descriptionLocalizations?: LocalizationMap;
}

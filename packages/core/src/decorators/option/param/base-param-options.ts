import { LocalizationMap } from 'discord.js';

export interface BaseParamOptions {
  /**
   * Option description
   */
  description: string;

  /**
   * Localize description
   */
  descriptionLocalizations?: LocalizationMap;

  /**
   * Sets a new name for the option
   * The default is the name of the property being decorated
   */
  name?: string;

  /**
   * Localize name
   */
  nameLocalizations?: LocalizationMap;

  /**
   * Is required option
   */
  required?: boolean;
}

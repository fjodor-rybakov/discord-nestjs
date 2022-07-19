import { LocalizationMap } from 'discord.js';

export interface UseGroupOptions {
  /**
   * Group name
   */
  name: string;

  /**
   * Localize name
   */
  nameLocalizations?: LocalizationMap;

  /**
   * Group description
   */
  description: string;

  /**
   * Localize description
   */
  descriptionLocalizations?: LocalizationMap;
}

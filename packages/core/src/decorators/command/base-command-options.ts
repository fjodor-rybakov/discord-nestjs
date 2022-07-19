import { LocalizationMap, PermissionResolvable } from 'discord.js';

export interface BaseCommandOptions {
  /**
   * Command name
   */
  name: string;

  /**
   * Localize name
   */
  nameLocalizations?: LocalizationMap;

  /**
   * Set default permission
   */
  defaultMemberPermissions?: PermissionResolvable;

  /**
   * Has dm permission
   */
  dmPermission?: boolean;
}

import { ApplicationCommandPermissionData, Snowflake } from 'discord.js';

export interface PermissionOptions {
  /**
   * Guild id to apply the permission
   */
  guildId: Snowflake;

  /**
   * Permission list
   */
  permissions: ApplicationCommandPermissionData[];
}

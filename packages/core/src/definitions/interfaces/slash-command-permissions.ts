import { Type } from '@nestjs/common';
import { ApplicationCommandPermissionData } from 'discord.js';

export interface SlashCommandPermissions {
  /**
   * Class type that describes the command
   */
  commandClassType: Type;

  /**
   * Permission list
   */
  permissions: ApplicationCommandPermissionData[];
}

import { Type } from '@nestjs/common';
import { ApplicationCommandPermissionData } from 'discord.js';

export interface SlashCommandPermissions {
  /**
   * Command class type
   */
  commandClassType: Type;

  /**
   * Permission list
   */
  permissions: ApplicationCommandPermissionData[];
}

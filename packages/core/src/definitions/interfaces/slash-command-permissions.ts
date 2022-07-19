import { Type } from '@nestjs/common';
import { ApplicationCommandPermissions } from 'discord.js';

export interface SlashCommandPermissions {
  /**
   * Class type that describes the command
   */
  commandClassType: Type;

  /**
   * Permission list
   */
  permissions: ApplicationCommandPermissions[];
}

import { Type } from '@nestjs/common';

import { PermissionOptions } from './permission-options';

export interface SlashCommandPermissions {
  /**
   * Command class type
   */
  commandClassType: Type;

  /**
   * Permissions
   */
  permissionOptions: PermissionOptions[];
}

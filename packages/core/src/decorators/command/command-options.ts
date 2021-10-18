import { TInclude } from '../../definitions/types/include.type';

/**
 * Describe base command options
 */
export interface CommandOptions {
  /**
   * Command name
   */
  name: string;

  /**
   * Command description
   */
  description: string;

  /**
   * Include sub groups and sub commands
   */
  include?: TInclude[];

  /**
   * Set default permission
   */
  defaultPermission?: boolean;
}

import { TInclude } from '../../definitions/types/include.type';

/**
 * Describe base command options
 */
export interface CommandOptions {
  name: string;

  description: string;

  include?: TInclude[];

  defaultPermission?: boolean;
}

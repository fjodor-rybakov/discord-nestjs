import { ParamType } from '../../../definitions/types/param.type';

export interface ParamOptions {
  /**
   * Option description
   */
  description: string;

  /**
   * Sets a new name for the option
   * The default is the name of the property being decorated
   */
  name?: string;

  /**
   * Is required option
   */
  required?: boolean;

  /**
   *
   */
  type?: ParamType;
}

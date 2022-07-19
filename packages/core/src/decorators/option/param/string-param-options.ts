import { ParamType } from '../../../definitions/types/param.type';
import { BaseParamOptions } from './base-param-options';

export interface StringParamOptions extends BaseParamOptions {
  /**
   * String param type
   */
  type?: ParamType.STRING;

  /**
   * Min string length
   */
  minLength?: number;

  /**
   * Max string length
   */
  maxLength?: number;

  /**
   * Use autocomplete
   */
  autocomplete?: boolean;
}

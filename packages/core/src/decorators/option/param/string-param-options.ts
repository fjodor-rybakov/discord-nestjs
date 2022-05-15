import { ParamType } from '../../../definitions/types/param.type';
import { BaseParamOptions } from './base-param-options';

export interface StringParamOptions extends BaseParamOptions {
  /**
   * String param type
   */
  type?: ParamType.STRING;

  /**
   * Use autocomplete
   */
  autocomplete?: boolean;
}

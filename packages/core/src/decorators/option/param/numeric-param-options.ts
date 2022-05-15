import { ParamType } from '../../../definitions/types/param.type';
import { BaseParamOptions } from './base-param-options';

export interface NumericParamOptions extends BaseParamOptions {
  /**
   * Numeric param type
   */
  type?: ParamType.INTEGER | ParamType.NUMBER;

  /**
   * Limit minimum value
   */
  minValue?: number;

  /**
   * Limit maximum value
   */
  maxValue?: number;

  /**
   * Use autocomplete
   */
  autocomplete?: boolean;
}

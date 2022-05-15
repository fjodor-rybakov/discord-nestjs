import { NonParamOptions } from './non-param-options';
import { NumericParamOptions } from './numeric-param-options';
import { StringParamOptions } from './string-param-options';

export type ParamOptions =
  | NumericParamOptions
  | StringParamOptions
  | NonParamOptions;

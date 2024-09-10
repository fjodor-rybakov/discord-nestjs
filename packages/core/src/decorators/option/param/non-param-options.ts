import { ParamType } from '../../../definitions/types/param.type';
import { BaseParamOptions } from './base-param-options';

export interface NonParamOptions extends BaseParamOptions {
  /**
   * Param type
   */
  type?:
    | ParamType.BOOLEAN
    | ParamType.ROLE
    | ParamType.MENTIONABLE
    | ParamType.USER
    | ParamType.ATTACHMENT
    | ParamType.CHANNEL;
}

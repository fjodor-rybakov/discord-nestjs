import { DecoratorParamInfo } from './decorator-param-info';

export interface ParamOptions {
  instance: unknown;

  methodName: string;

  params: DecoratorParamInfo[];
}

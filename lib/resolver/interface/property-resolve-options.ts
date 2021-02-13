import { DecoratorParamType } from '../../constant/decorator-param-type';

interface DecoratorArg {
  index: number;
}

export interface PropertyResolveOptions {
  instance: unknown;
  methodName: string;
  args: Map<DecoratorParamType, DecoratorArg>
}
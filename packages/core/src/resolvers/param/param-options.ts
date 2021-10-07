import { DecoratorTypeArg } from './decorator-type-arg';

export interface ParamOptions {
  instance: unknown;

  methodName: string;

  args: DecoratorTypeArg[];
}

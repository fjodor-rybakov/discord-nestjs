import { DecoratorParamType } from './decorator-param-type';
import { Type } from '@nestjs/common';

export interface DecoratorTypeArg {
  decoratorType: DecoratorParamType;

  paramType?: Type;
}

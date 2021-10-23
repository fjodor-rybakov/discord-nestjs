import { DecoratorParamType } from './decorator-param-type';
import { Type } from '@nestjs/common';

export interface DecoratorParamInfo {
  decoratorType: DecoratorParamType;

  paramType?: Type;
}

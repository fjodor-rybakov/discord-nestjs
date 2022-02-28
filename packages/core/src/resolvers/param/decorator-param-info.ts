import { Type } from '@nestjs/common';

import { DecoratorParamType } from './decorator-param-type';

export interface DecoratorParamInfo {
  decoratorType: DecoratorParamType;

  paramType?: Type;
}

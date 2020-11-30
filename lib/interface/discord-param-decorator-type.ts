import { DecoratorParamType } from '../utils/enums/decorator-param-type';

export interface DiscordParamDecoratorType {
  parameterIndex: number;

  type: DecoratorParamType;
}

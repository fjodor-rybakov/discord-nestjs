import { DecoratorParamType } from '../../constant/decorator-param-type';

export interface DiscordParamDecoratorType {
  parameterIndex: number;

  type: DecoratorParamType;
}

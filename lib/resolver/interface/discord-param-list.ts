import { DecoratorParamType } from '../../constant/decorator-param-type';

export interface DiscordParamList {
  instance: unknown;
  propertyKey: string;
  type: DecoratorParamType;
  index: number;
}
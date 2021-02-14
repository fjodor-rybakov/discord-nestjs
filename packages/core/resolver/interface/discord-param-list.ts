import { DecoratorTypeArg } from './decorator-type-arg';

export interface DiscordParamList {
  instance: unknown;
  methodName: string;
  args: DecoratorTypeArg[];
}
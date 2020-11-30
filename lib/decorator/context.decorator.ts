import { CONTEXT_DECORATOR } from '../constant/discord.constant';
import { DecoratorParamType } from '../utils/enums/decorator-param-type';

/**
 * Context decorator
 */
export const Context = (): ParameterDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string,
    parameterIndex: number,
  ): void => {
    Reflect.defineMetadata(
      CONTEXT_DECORATOR,
      { parameterIndex, type: DecoratorParamType.CONTEXT },
      target,
      propertyKey,
    );
  };
};

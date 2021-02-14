import { DecoratorConstant } from '../constant/decorator.constant';
import { DecoratorParamType } from '../constant/decorator-param-type';

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
      DecoratorConstant.CONTEXT_DECORATOR,
      { parameterIndex, type: DecoratorParamType.CONTEXT },
      target,
      propertyKey,
    );
  };
};

import { DecoratorConstant } from '../constant/decorator.constant';
import { DecoratorParamType } from '../constant/decorator-param-type';

/**
 * Message content decorator
 */
export const Content = (): ParameterDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string,
    parameterIndex: number,
  ): void => {
    Reflect.defineMetadata(
      DecoratorConstant.CONTENT_DECORATOR,
      { parameterIndex, type: DecoratorParamType.CONTENT },
      target,
      propertyKey,
    );
  };
};

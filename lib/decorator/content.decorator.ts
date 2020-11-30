import { CONTENT_DECORATOR } from '../constant/discord.constant';
import { DecoratorParamType } from '../utils/enums/decorator-param-type';

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
      CONTENT_DECORATOR,
      { parameterIndex, type: DecoratorParamType.CONTENT },
      target,
      propertyKey,
    );
  };
};

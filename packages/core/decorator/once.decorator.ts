import { OnDecoratorOptions } from './interface/on-decorator-options';
import { DecoratorConstant } from '../constant/decorator.constant';

/**
 * Once handle event decorator
 */
export const Once = (options: OnDecoratorOptions): MethodDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(
      DecoratorConstant.ONCE_DECORATOR,
      options,
      target,
      propertyKey,
    );
    return descriptor;
  };
};

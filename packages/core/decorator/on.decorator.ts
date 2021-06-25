import { DecoratorConstant } from '../constant/decorator.constant';
import { OnDecoratorOptions } from './interface/on-decorator-options';

/**
 * On event decorator
 */
export const On = (options: OnDecoratorOptions): MethodDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(
      DecoratorConstant.ON_DECORATOR,
      options,
      target,
      propertyKey,
    );
    return descriptor;
  };
};

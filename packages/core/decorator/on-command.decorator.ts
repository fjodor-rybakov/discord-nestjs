import { OnCommandDecoratorOptions } from './interface/on-command-decorator-options';
import { DecoratorConstant } from '../constant/decorator.constant';

/**
 * On command decorator
 */
export const OnCommand = (
  options: OnCommandDecoratorOptions,
): MethodDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(DecoratorConstant.ON_COMMAND_DECORATOR, options, target, propertyKey);
    return descriptor;
  };
};

import { ON_MESSAGE_DECORATOR } from '../constant/discord.constant';
import { OnCommandDecoratorOptions } from './interface/on-command-decorator-options';

/**
 * On command decorator
 */
export const OnCommand = (options?: OnCommandDecoratorOptions): MethodDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(ON_MESSAGE_DECORATOR, options, target, propertyKey);
    return descriptor;
  };
};


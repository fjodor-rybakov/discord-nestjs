import { ON_MESSAGE_DECORATOR } from '../constant/discord.constant';
import { OnCommandDecoratorOptions } from './interface/on-command-decorator-options';

export const OnCommand = (prefix?: OnCommandDecoratorOptions): MethodDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(ON_MESSAGE_DECORATOR, prefix, target, propertyKey);
    return descriptor;
  };
};


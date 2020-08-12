import { ON_DECORATOR } from '../constant/discord.constant';
import { OnDecoratorOptions } from './interface/on-decorator-options';

export const On = (options?: OnDecoratorOptions): MethodDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(ON_DECORATOR, options, target, propertyKey);
    return descriptor;
  };
};

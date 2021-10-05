import { ClientEvents } from 'discord.js';
import { ON_DECORATOR } from './on.constant';

/**
 * On event decorator
 */
export function On(event: keyof ClientEvents): MethodDecorator {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(ON_DECORATOR, { event }, target, propertyKey);

    return descriptor;
  };
}

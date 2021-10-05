import { ClientEvents } from 'discord.js';
import { ONCE_DECORATOR } from './once.constant';

/**
 * Once handle event decorator
 */
export function Once(event: keyof ClientEvents): MethodDecorator {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(ONCE_DECORATOR, { event }, target, propertyKey);

    return descriptor;
  };
}

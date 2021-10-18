import { ONCE_DECORATOR } from './once.constant';
import { ClientEvents } from 'discord.js';

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

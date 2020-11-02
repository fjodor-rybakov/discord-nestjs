import { USE_GUARDS_DECORATOR } from '../constant/discord.constant';
import { DiscordGuard } from '..';

/**
 * UseGuards decorator
 */
export const UseGuards = (
  ...guards: (DiscordGuard | Function)[]
): MethodDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(USE_GUARDS_DECORATOR, guards, target, propertyKey);
    return descriptor;
  };
};

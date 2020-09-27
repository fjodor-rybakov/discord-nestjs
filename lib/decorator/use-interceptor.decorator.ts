import { USE_INTERCEPTORS_DECORATOR } from '../constant/discord.constant';
import { DiscordInterceptor } from '..';

/**
 * UseInterceptor decorator
 */
export const UseInterceptors = (...interceptors: (DiscordInterceptor | Function)[]): MethodDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(USE_INTERCEPTORS_DECORATOR, interceptors, target, propertyKey);
    return descriptor;
  };
};

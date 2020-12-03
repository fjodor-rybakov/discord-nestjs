import { USE_PIPES_DECORATOR } from '../constant/discord.constant';
import { DiscordPipeTransform } from '..';

/**
 * UsePipes decorator
 */
export const UsePipes = (
  ...pipes: (DiscordPipeTransform | Function)[]
): MethodDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(USE_PIPES_DECORATOR, pipes, target, propertyKey);
    return descriptor;
  };
};

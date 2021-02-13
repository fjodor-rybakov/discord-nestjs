import { DecoratorConstant } from '../constant/decorator.constant';
import { DiscordPipeTransform } from './interface/discord-pipe-transform';

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
    Reflect.defineMetadata(DecoratorConstant.USE_PIPES_DECORATOR, pipes, target, propertyKey);
    return descriptor;
  };
};

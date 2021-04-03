import { DecoratorConstant } from '../constant/decorator.constant';
import { DiscordPipeTransform } from './interface/discord-pipe-transform';

/**
 * UsePipes decorator
 */
export const UsePipes = (
  ...pipes: (DiscordPipeTransform | Function)[]
): MethodDecorator & ClassDecorator => {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(DecoratorConstant.USE_PIPES_DECORATOR, pipes, target, propertyKey);
      return descriptor;
    }
    Reflect.defineMetadata(DecoratorConstant.USE_PIPES_DECORATOR, pipes, target.prototype);
    return target;
  };
};

import { PipeType } from '../../definitions/types/pipe.type';
import { USE_PIPES_DECORATOR } from './pipe.constant';

/**
 * UsePipes decorator
 *
 * Takes list of pipes that transform values in turn
 */
export function UsePipes(
  ...pipes: PipeType[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(USE_PIPES_DECORATOR, pipes, target, propertyKey);

      return descriptor;
    }
    Reflect.defineMetadata(USE_PIPES_DECORATOR, pipes, target.prototype);

    return target;
  };
}

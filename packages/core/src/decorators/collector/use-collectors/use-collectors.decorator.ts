import { USE_COLLECTORS_METADATA } from './use-collectors.constant';
import { Type } from '@nestjs/common';

/**
 * Use collectors decorator
 */
export function UseCollectors(
  ...collectors: Type[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(
        USE_COLLECTORS_METADATA,
        collectors,
        target,
        propertyKey,
      );

      return descriptor;
    }
    Reflect.defineMetadata(
      USE_COLLECTORS_METADATA,
      collectors,
      target.prototype,
    );

    return target;
  };
}

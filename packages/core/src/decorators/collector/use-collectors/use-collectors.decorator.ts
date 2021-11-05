import { USE_COLLECTORS_METADATA } from './use-collectors.constant';
import { Type } from '@nestjs/common';

/**
 * Use collectors decorator
 */
export function UseCollectors(...collectors: Type[]): MethodDecorator {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(
      USE_COLLECTORS_METADATA,
      collectors,
      target,
      propertyKey,
    );

    return descriptor;
  };
}

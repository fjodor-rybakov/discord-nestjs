import { Type } from '@nestjs/common';

import { FILTER_METADATA } from './filter.constant';

/**
 * Filter decorator
 */
export function Filter(...collectors: Type[]): MethodDecorator {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(FILTER_METADATA, collectors, target, propertyKey);

    return descriptor;
  };
}

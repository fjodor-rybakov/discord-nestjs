import { ArgRangeOptions } from './arg-range-options';
import { ARG_RANGE_DECORATOR } from './arg-range.constant';

/**
 * Set value by argument range
 */
export const ArgRange = (
  options: (last: number) => ArgRangeOptions,
): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(
      ARG_RANGE_DECORATOR,
      options,
      target.constructor,
      propertyKey,
    );
  };
};

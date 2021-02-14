import { DecoratorConstant } from '../constant/decorator.constant';
import { ArgRangeOptions } from './interface/arg-range-options';

/**
 * Set value by argument range
 */
export const ArgRange = (options: (last: number) => ArgRangeOptions): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(
      DecoratorConstant.ARG_RANGE_DECORATOR,
      options,
      target,
      propertyKey,
    );
  };
};

import { FilterType } from '../../definitions/types/filter.type';
import { USE_FILTER_DECORATOR } from './use-filter.constant';

/**
 * Use filters decorator
 */
export function UseFilters(
  ...filters: FilterType[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(
        USE_FILTER_DECORATOR,
        filters,
        target,
        propertyKey,
      );

      return descriptor;
    }
    Reflect.defineMetadata(USE_FILTER_DECORATOR, filters, target.prototype);

    return target;
  };
}

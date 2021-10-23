import { FilterType } from '../../definitions/types/filter.type';
import { USE_FILTER_DECORATOR } from './use-filter.constant';

/**
 * Use filters decorator
 *
 * Takes list of filters. If an exception is thrown, it will be handled by one of the filters
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

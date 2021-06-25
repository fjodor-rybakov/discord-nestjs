import { DecoratorConstant } from '../constant/decorator.constant';
import { ArgNumOptions } from './interface/arg-num-options';

/**
 * Set value by argument number
 */
export const ArgNum = (
  options: (last: number) => ArgNumOptions,
): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(
      DecoratorConstant.ARG_NUM_DECORATOR,
      options,
      target,
      propertyKey,
    );
  };
};

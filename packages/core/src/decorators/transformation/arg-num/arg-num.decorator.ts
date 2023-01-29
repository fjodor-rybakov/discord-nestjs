import { ArgNumOptions } from './arg-num-options';
import { ARG_NUM_DECORATOR } from './arg-num.constant';

/**
 * Set value by argument number
 */
export const ArgNum = (
  options: (last: number) => ArgNumOptions,
): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(
      ARG_NUM_DECORATOR,
      options,
      target.constructor,
      propertyKey,
    );
  };
};

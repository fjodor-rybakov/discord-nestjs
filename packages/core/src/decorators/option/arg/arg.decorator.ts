import { ArgOptions } from './arg-options';
import { ARG_DECORATOR } from './arg.constant';

/**
 * Arg decorator
 */
export function Arg(options: ArgOptions): PropertyDecorator {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(ARG_DECORATOR, options, target, propertyKey);
  };
}

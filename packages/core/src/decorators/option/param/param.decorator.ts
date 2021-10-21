import { ParamOptions } from './param-options';
import { PARAM_DECORATOR } from './param.constant';

/**
 * Param decorator
 */
export function Param(options: ParamOptions): PropertyDecorator {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(PARAM_DECORATOR, options, target, propertyKey);
  };
}

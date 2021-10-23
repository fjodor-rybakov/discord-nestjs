import { MiddlewareOptions } from './middleware-options';
import { MIDDLEWARE_DECORATOR } from './middleware.constant';

/**
 * Middleware decorator
 */
export function Middleware(options: MiddlewareOptions = {}): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(MIDDLEWARE_DECORATOR, options, target.prototype);

    return target;
  };
}

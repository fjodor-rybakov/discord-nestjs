import { MiddlewareOptions } from './middleware-options';
import { MIDDLEWARE_DECORATOR } from './middleware.constant';
import { applyDecorators, Injectable } from '@nestjs/common';

/**
 * Middleware decorator
 */
export function Middleware(options: MiddlewareOptions = {}): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    applyDecorators(Injectable(options));
    Reflect.defineMetadata(MIDDLEWARE_DECORATOR, options, target.prototype);

    return target;
  };
}

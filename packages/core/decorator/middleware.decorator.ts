import { applyDecorators, Injectable } from '@nestjs/common';
import { MiddlewareOptions } from './interface/middleware-options';
import { DecoratorConstant } from '../constant/decorator.constant';

/**
 * Middleware decorator
 */
export const Middleware = (options: MiddlewareOptions = {}): ClassDecorator => {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    applyDecorators(Injectable(options));
    Reflect.defineMetadata(
      DecoratorConstant.MIDDLEWARE_DECORATOR,
      options,
      target.prototype,
    );
    return target;
  };
};

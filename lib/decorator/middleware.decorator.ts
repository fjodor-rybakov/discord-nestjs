import { MIDDLEWARE_DECORATOR } from '../constant/discord.constant';
import { applyDecorators, Injectable } from '@nestjs/common';
import { MiddlewareOptions } from './interface/middleware-options';

/**
 * Middleware decorator
 */
export const Middleware = (options: MiddlewareOptions = {}): ClassDecorator => {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    applyDecorators(Injectable(options));
    Reflect.defineMetadata(MIDDLEWARE_DECORATOR, options, target.prototype);
    return target;
  };
};

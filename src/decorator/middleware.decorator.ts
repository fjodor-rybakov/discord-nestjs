import { MIDDLEWARE_DECORATOR } from '../constant/discord.constant';
import { applyDecorators, Injectable } from '@nestjs/common';

/**
 * Middleware decorator
 */
export const Middleware = (): ClassDecorator => {
  return <TFunction extends Function>(
    target: TFunction
  ):  TFunction | void => {
    applyDecorators(Injectable);
    Reflect.defineMetadata(MIDDLEWARE_DECORATOR, {}, target.prototype);
    return target;
  };
};

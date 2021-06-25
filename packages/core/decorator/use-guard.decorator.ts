import { DecoratorConstant } from '../constant/decorator.constant';
import { GuardType } from '../util/type/guard-type';

/**
 * UseGuards decorator
 */
export const UseGuards = (
  ...guards: GuardType[]
): MethodDecorator & ClassDecorator => {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(
        DecoratorConstant.USE_GUARDS_DECORATOR,
        guards,
        target,
        propertyKey,
      );
      return descriptor;
    }
    Reflect.defineMetadata(
      DecoratorConstant.USE_GUARDS_DECORATOR,
      guards,
      target.prototype,
    );
    return target;
  };
};

import { USE_GUARDS_DECORATOR } from './guard.constant';
import { GuardType } from '../../definitions/types/guard.type';

/**
 * UseGuards decorator
 */
export function UseGuards(
  ...guards: GuardType[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(USE_GUARDS_DECORATOR, guards, target, propertyKey);

      return descriptor;
    }
    Reflect.defineMetadata(USE_GUARDS_DECORATOR, guards, target.prototype);

    return target;
  };
}

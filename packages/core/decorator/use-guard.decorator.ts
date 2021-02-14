import { DecoratorConstant } from '../constant/decorator.constant';
import { GuardType } from '../util/type/guard-type';

/**
 * UseGuards decorator
 */
export const UseGuards = (
  ...guards: GuardType[]
): MethodDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(DecoratorConstant.USE_GUARDS_DECORATOR, guards, target, propertyKey);
    return descriptor;
  };
};

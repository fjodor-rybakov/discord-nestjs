import { DecoratorConstant } from '../constant/decorator.constant';
import { TransformToUserOptions } from './interface/transform-to-user-options';

/**
 * Transform user alias to user object
 */
export const TransformToUser = (
  options: TransformToUserOptions = { throwError: false },
): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      DecoratorConstant.TRANSFORM_TO_USER_DECORATOR,
      options,
      target,
      propertyKey,
    );
  };
};

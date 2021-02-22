import { DecoratorConstant } from '../constant/decorator.constant';

/**
 * Transform user alias to user object
 */
export const TransformToUser = (): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      DecoratorConstant.TRANSFORM_TO_USER_DECORATOR,
      {},
      target,
      propertyKey,
    );
  }
}
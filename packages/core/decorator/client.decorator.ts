import { DecoratorConstant } from '../constant/decorator.constant';

/**
 * Discord client decorator
 */
export const Client = (): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.set(target, propertyKey, null);
    Reflect.defineMetadata(
      DecoratorConstant.CLIENT_DECORATOR,
      {},
      target,
      propertyKey,
    );
  };
};

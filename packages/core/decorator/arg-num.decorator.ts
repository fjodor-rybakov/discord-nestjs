import { DecoratorConstant } from '../constant/decorator.constant';

/**
 * Set value by argument number
 */
export const ArgNum = (position: number): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(
      DecoratorConstant.ARG_NUM_DECORATOR,
      { position },
      target,
      propertyKey,
    );
  };
};

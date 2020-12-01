import { ARG_NUM_DECORATOR } from '../constant/discord.constant';

/**
 * Set value by argument number
 */
export const ArgNum = (position: number): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.set(target, propertyKey, null);
    Reflect.defineMetadata(
      ARG_NUM_DECORATOR,
      { position },
      target,
      propertyKey,
    );
  };
};

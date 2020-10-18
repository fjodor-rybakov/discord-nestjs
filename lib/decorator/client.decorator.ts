import { CLIENT_DECORATOR } from '../constant/discord.constant';

/**
 * Discord client decorator
 */
export const Client = (): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.set(target, propertyKey, null);
    Reflect.defineMetadata(CLIENT_DECORATOR, {}, target, propertyKey);
  };
};

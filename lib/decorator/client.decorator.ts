import { ON_MESSAGE_DECORATOR } from '../constant/discord.constant';

export const Client = (): PropertyDecorator => {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(ON_MESSAGE_DECORATOR, {}, target, propertyKey);
  };
};

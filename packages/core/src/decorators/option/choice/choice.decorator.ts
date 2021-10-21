import { CHOICE_DECORATOR } from './choice.constant';

/**
 * Choice decorator
 */
export function Choice(options: Record<string, any>): PropertyDecorator {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(CHOICE_DECORATOR, options, target, propertyKey);
  };
}
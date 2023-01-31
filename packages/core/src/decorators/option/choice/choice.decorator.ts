import { ChoiceOptions } from './choice-options';
import { CHOICE_DECORATOR } from './choice.constant';

/**
 * Choice decorator
 */
export function Choice(options: ChoiceOptions): PropertyDecorator {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(
      CHOICE_DECORATOR,
      options,
      target.constructor,
      propertyKey,
    );
  };
}

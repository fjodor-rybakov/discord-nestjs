import { TEXT_INPUT_VALUE_DECORATOR } from './text-input-value.constant';

/**
 * Extract text input value from modal form
 */
export function TextInputValue(customId?: string): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(
      TEXT_INPUT_VALUE_DECORATOR,
      { customId },
      target,
      propertyKey,
    );
  };
}

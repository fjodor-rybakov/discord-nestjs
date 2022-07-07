import { FIELD_DECORATOR } from './field.constant';

/**
 * Extract field from modal form
 */
export function Field(customId?: string): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(FIELD_DECORATOR, { customId }, target, propertyKey);
  };
}

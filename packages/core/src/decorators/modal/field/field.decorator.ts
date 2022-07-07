import { FIELD_DECORATOR } from './field.constant';

export function Field(customId: string): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(FIELD_DECORATOR, customId, target, propertyKey);
  };
}

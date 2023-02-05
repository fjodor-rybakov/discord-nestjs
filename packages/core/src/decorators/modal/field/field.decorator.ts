import { IsObject } from '../../../utils/function/is-object';
import { FieldOptions } from './field-options';
import { FIELD_DECORATOR } from './field.constant';

/**
 * Extract field from modal form
 */
export function Field(options?: FieldOptions): PropertyDecorator;
export function Field(customId?: string): PropertyDecorator;
export function Field(arg?: FieldOptions | string): PropertyDecorator {
  return (target, propertyKey) => {
    let result = arg || {};

    if (!IsObject(arg)) result = { customId: arg };

    Reflect.defineMetadata(
      FIELD_DECORATOR,
      result,
      target.constructor,
      propertyKey,
    );
  };
}

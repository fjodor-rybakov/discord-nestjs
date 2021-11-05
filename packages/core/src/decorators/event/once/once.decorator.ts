import { EventType } from '../../../definitions/types/event.type';
import { IsBaseEvent } from '../../../utils/guard/is-base-event';
import { ONCE_COLLECT_DECORATOR, ONCE_DECORATOR } from './once.constant';

/**
 * Once handle event decorator
 *
 * Subscribe only once to Discord event
 */
export function Once(event: EventType): MethodDecorator {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    if (IsBaseEvent(event)) {
      Reflect.defineMetadata(ONCE_DECORATOR, { event }, target, propertyKey);
    } else {
      Reflect.defineMetadata(
        ONCE_COLLECT_DECORATOR,
        { event },
        target,
        propertyKey,
      );
    }

    return descriptor;
  };
}

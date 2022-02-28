import { EventType } from '../../../definitions/types/event.type';
import { IsBaseEvent } from '../../../utils/guard/is-base-event';
import { ON_COLLECT_DECORATOR, ON_DECORATOR } from './on.constant';

/**
 * On event decorator
 *
 * Subscribe to Discord event
 */
export function On(event: EventType): MethodDecorator {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    if (IsBaseEvent(event)) {
      Reflect.defineMetadata(ON_DECORATOR, { event }, target, propertyKey);
    } else {
      Reflect.defineMetadata(
        ON_COLLECT_DECORATOR,
        { event },
        target,
        propertyKey,
      );
    }

    return descriptor;
  };
}

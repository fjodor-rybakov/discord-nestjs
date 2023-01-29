import { HANDLER_DECORATOR } from './handler.constant';

export function Handler(): MethodDecorator {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(HANDLER_DECORATOR, {}, target, propertyKey);

    return descriptor;
  };
}

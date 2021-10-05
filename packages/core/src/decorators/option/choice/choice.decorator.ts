import { SUB_COMMAND_DECORATOR } from '../../command/sub-command/sub-command.constant';

/**
 * Choice decorator
 */
export function Choice(): PropertyDecorator {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(SUB_COMMAND_DECORATOR, {}, target, propertyKey);
  };
}

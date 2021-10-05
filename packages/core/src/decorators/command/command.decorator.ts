import { COMMAND_DECORATOR } from './command.constant';
import { CommandOptions } from './command-options';

export function Command(options: CommandOptions): MethodDecorator {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(COMMAND_DECORATOR, options, target, propertyKey);

    return descriptor;
  };
}

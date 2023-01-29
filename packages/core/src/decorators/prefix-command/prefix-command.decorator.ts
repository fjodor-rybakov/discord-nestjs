import { PrefixCommandOptions } from './prefix-command-options';
import { ON_PREFIX_COMMAND_DECORATOR } from './prefix-command.constant';

/**
 * On prefix-command command decorator
 *
 * Create prefix-command command
 */
export function PrefixCommand(
  name: string,
  options?: Omit<PrefixCommandOptions, 'name'>,
): MethodDecorator;
export function PrefixCommand(options: PrefixCommandOptions): MethodDecorator;
export function PrefixCommand(...args: any[]): MethodDecorator {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const [name, options] = args;

    const prefixCommandOptions =
      typeof name === 'string'
        ? {
            name,
            ...options,
          }
        : name;

    Reflect.defineMetadata(
      ON_PREFIX_COMMAND_DECORATOR,
      prefixCommandOptions,
      target,
      propertyKey,
    );

    return descriptor;
  };
}

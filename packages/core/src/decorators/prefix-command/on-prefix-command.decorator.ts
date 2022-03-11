import { ON_PREFIX_COMMAND_DECORATOR } from './on-prefix-command.constant';
import { PrefixCommandOptions } from './prefix-command-options';

/**
 * On prefix command decorator
 *
 * Crate prefix command
 */
export function OnPrefixCommand(
  name: string,
  options?: Omit<PrefixCommandOptions, 'name'>,
): MethodDecorator;
export function OnPrefixCommand(options: PrefixCommandOptions): MethodDecorator;
export function OnPrefixCommand(...args: any[]): MethodDecorator {
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

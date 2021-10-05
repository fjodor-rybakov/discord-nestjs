import { SUB_COMMAND_DECORATOR } from './sub-command.constant';
import { CommandOptions } from '../command-options';

/**
 * SubCommand decorator
 */
export function SubCommand(options: CommandOptions): PropertyDecorator {
  return (target: Record<string, any>, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(SUB_COMMAND_DECORATOR, options, target, propertyKey);
  };
}

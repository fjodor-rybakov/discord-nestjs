import { SubCommandOptions } from './sub-command-options';
import { SUB_COMMAND_DECORATOR } from './sub-command.constant';

/**
 * SubCommand decorator
 */
export function SubCommand(options: SubCommandOptions): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(SUB_COMMAND_DECORATOR, options, target.prototype);

    return target;
  };
}

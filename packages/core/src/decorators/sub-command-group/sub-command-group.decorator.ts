import { SUB_COMMAND_GROUP_DECORATOR } from './sub-command-group.constant';
import { SubCommandGroupOptions } from './sub-command-group-options';

/**
 * SubCommandGroup decorator
 */
export function SubCommandGroup(
  option: SubCommandGroupOptions,
): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(
      SUB_COMMAND_GROUP_DECORATOR,
      option,
      target.prototype,
    );

    return target;
  };
}

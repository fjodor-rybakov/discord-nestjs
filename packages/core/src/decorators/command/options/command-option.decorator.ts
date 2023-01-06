import { COMMAND_OPTION } from './command-option.contant';

export function CommandOption(): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(COMMAND_OPTION, {}, target.prototype);

    return target;
  };
}

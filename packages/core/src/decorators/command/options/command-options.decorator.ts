import { COMMAND_OPTIONS } from './command-options.contant';

export function CommandOptions(): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(COMMAND_OPTIONS, {}, target.prototype);

    return target;
  };
}

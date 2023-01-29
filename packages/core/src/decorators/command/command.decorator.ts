import { ChatInputCommandOptions } from './chat-input-command-options';
import { COMMAND_DECORATOR } from './command.constant';
import { UICommandOptions } from './ui-command-options';

/**
 * Command decorator
 *
 * Register new slash command
 */
export function Command(options: ChatInputCommandOptions): ClassDecorator;
export function Command(options: UICommandOptions): ClassDecorator;
export function Command(
  options: ChatInputCommandOptions | UICommandOptions,
): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(COMMAND_DECORATOR, options, target.prototype);

    return target;
  };
}

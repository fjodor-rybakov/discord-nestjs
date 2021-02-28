/**
 * Command options
 */
export interface OnCommandDecoratorOptions {
  /**
   * Command name
   */
  name: string;

  /**
   * Your message prefix
   * @default from module definition
   */
  prefix?: string;

  /**
   * Remove command name
   * @default true
   */
  isRemoveCommandName?: boolean;

  /**
   * Remove prefix from message
   * @default true
   */
  isRemovePrefix?: boolean;

  /**
   * Ignore bot message
   * @default true
   */
  isIgnoreBotMessage?: boolean;

  /**
   * List of channel identifiers with which the bot will work
   */
  allowChannels?: string[];

  /**
   * Is remove message from channel after receive
   * @default false
   */
  isRemoveMessage?: boolean;

  /**
   * List of user identifiers with which the command will work
   */
  allowDirectMessageFor?: string[];
}

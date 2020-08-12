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
}

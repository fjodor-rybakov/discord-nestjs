export interface PrefixCommandOptions {
  /**
   * Remove command name from input string
   *
   * @default true
   */
  isRemoveCommandName?: boolean;

  /**
   * Remove prefix-command from input string
   *
   * @default true
   */
  isRemovePrefix?: boolean;

  /**
   * Ignore messages from bots
   *
   * @default true
   */
  isIgnoreBotMessage?: boolean;

  /**
   * Remove message from channel after processing
   *
   * @default false
   */
  isRemoveMessage?: boolean;

  /**
   * Prefix for text command
   *
   * @default !
   */
  prefix?: string;
}

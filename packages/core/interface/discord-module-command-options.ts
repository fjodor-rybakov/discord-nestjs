export interface DiscordModuleCommandOptions {
  /**
   * Command name from gateway
   */
  name: string;

  /**
   * Channel identifiers
   */
  channels?: string[];

  /**
   * List of user identifiers with which the bot will work
   */
  allowDirectMessageFor?: string[];
}

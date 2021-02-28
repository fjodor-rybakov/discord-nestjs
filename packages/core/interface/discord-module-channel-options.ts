export interface DiscordModuleChannelOptions {
  /**
   * Command name from gateway
   */
  commandName: string;

  /**
   * Channel identifiers
   */
  channels: string[];

  /**
   * List of user identifiers with which the bot will work
   */
  allowDirectMessageFor?: string[];
}

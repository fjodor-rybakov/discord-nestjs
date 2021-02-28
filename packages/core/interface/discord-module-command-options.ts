export interface DiscordModuleCommandOptions {
  /**
   * Command name from gateway
   */
  name: string;

  /**
   * List of channel identifiers with which the command will work
   */
  channels?: string[];

  /**
   * List of user identifiers with which the command will work
   */
  users?: string[];
}

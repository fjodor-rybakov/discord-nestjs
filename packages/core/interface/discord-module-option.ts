import { ClientOptions } from 'discord.js';
import { DiscordModuleCommandOptions } from './discord-module-command-options';
import { DiscordModuleWebhookOptions } from './discord-module-webhook-options';
import { PipeType } from '../util/type/pipe-type';
import { GuardType } from '../util/type/guard-type';

export interface DiscordModuleOption extends ClientOptions {
  /**
   * Authorization token
   */
  token: string;

  /**
   * Start prefix for command
   */
  commandPrefix: string;

  /**
   * List of guild identifiers with which the bot will work
   */
  allowGuilds?: string[];

  /**
   * List of guilds identifiers with which the bot will not work
   */
  denyGuilds?: string[];

  /**
   * Binding channels and user to a command. Can be overridden in the handler decorator
   */
  allowCommands?: DiscordModuleCommandOptions[];

  /**
   * Use pipes for all handlers
   */
  usePipes?: PipeType[];

  /**
   * Use guards for all handlers
   */
  useGuards?: GuardType[];

  /**
   * Webhook for the bot
   */
  webhook?: DiscordModuleWebhookOptions;
}

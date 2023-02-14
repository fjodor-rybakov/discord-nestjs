import { ClientOptions, WebhookClientData } from 'discord.js';

import { RegisterCommandOptions } from './register-command-options';

export interface DiscordModuleOption {
  /**
   * Authorization token
   */
  token: string;

  /**
   * Client options from discord.js library
   */
  discordClientOptions: ClientOptions;

  /**
   * Specific registration of slash commands
   */
  registerCommandOptions?: RegisterCommandOptions[];

  /**
   * Webhook for the bot
   */
  webhook?: WebhookClientData;

  /**
   * Calling login function from discord client on application bootstrap
   *
   * @default true
   */
  autoLogin?: boolean;

  /**
   * Throw an exception if login failed
   *
   * @default false
   */
  failOnLogin?: boolean;

  /**
   * Shutdown bot on application destroy hook
   *
   * @default true
   */
  shutdownOnAppDestroy?: boolean;

  /**
   * Rethrow forbidden exception(in guard case)
   *
   * @default false
   */
  isTrowForbiddenException?: boolean;
}

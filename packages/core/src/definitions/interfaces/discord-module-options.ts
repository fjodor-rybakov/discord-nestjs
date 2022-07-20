import { ClientOptions, WebhookClientData } from 'discord.js';

import { PrefixCommandGlobalOptions } from './prefix-command-global-options';
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
   * Command prefix
   *
   * Only for prefix command
   */
  prefix?: string;

  /**
   * Global options for prefix command
   */
  prefixGlobalOptions?: PrefixCommandGlobalOptions;

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
}

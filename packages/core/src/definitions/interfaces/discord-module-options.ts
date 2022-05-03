import { ClientOptions, WebhookClientData } from 'discord.js';

import { PrefixCommandGlobalOptions } from './prefix-command-global-options';
import { RegisterCommandOptions } from './register-command-options';
import { SlashCommandPermissions } from './slash-command-permissions';

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
   * Slash command permission which allow you to control who has access to use
   */
  slashCommandsPermissions?: SlashCommandPermissions[];

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

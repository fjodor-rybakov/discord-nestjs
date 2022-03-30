import { ClientOptions, WebhookClientData } from 'discord.js';

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
   * @deprecated use instead `registerCommandOptions`
   *
   * Automatically register global commands in the Discord API
   *
   * If true then overlaps registerCommandOptions
   *
   * @default: false
   */
  autoRegisterGlobalCommands?: boolean;

  /**
   * @deprecated use instead `registerCommandOptions`
   *
   * Automatically remove global commands
   *
   * Start before `autoRegisterGlobalCommands`
   *
   * @default: false
   */
  removeGlobalCommands?: boolean;

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
   * Webhook for the bot
   */
  webhook?: WebhookClientData;
}

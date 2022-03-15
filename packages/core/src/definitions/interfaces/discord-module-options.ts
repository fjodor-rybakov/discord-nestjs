import { ClientOptions, WebhookClientData } from 'discord.js';

import { FilterType } from '../types/filter.type';
import { GuardType } from '../types/guard.type';
import { PipeType } from '../types/pipe.type';
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
   * Automatically register global commands in the Discord API
   *
   * If true then overlaps registerCommandOptions
   *
   * @default: false
   */
  autoRegisterGlobalCommands?: boolean;

  /**
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
   * Use pipes for all handlers
   * Takes list of class types or list of instances
   */
  usePipes?: PipeType[];

  /**
   * Use guards for all handlers
   * Takes list of class types or list of instances
   */
  useGuards?: GuardType[];

  /**
   * Use filters for all handlers
   * Takes list of class types or list of instances
   */
  useFilters?: FilterType[];

  /**
   * Webhook for the bot
   */
  webhook?: WebhookClientData;
}

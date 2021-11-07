import { Type } from '@nestjs/common';
import { ClientOptions, WebhookClientData } from 'discord.js';

import { FilterType } from '../types/filter.type';
import { GuardType } from '../types/guard.type';
import { PipeType } from '../types/pipe.type';
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
   * List of command classes
   * Accepts list of class types or list of search patterns
   */
  commands?: (Type | string)[];

  /**
   * Automatically register global commands in the Discord API
   *
   * If true then overlaps registerCommandOptions
   *
   * @default: false
   */
  autoRegisterGlobalCommands?: boolean;

  /**
   * Specific registration of slash commands
   */
  registerCommandOptions?: RegisterCommandOptions[];

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

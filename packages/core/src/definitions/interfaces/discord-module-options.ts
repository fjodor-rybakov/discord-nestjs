import { GuardType } from '../types/guard.type';
import { ClientOptions, WebhookClientData } from 'discord.js';
import { PipeType } from '../types/pipe.type';
import { Type } from '@nestjs/common';
import { FilterType } from '../types/filter.type';

export interface DiscordModuleOption {
  /**
   * Authorization token
   */
  token: string;

  /**
   * Automatically register global commands in the Discord API
   *
   * @default: true
   */
  autoRegisterCommands?: boolean;

  /**
   * List of command classes
   * Accepts list of class types or list of search patterns
   */
  commands?: (Type | string)[];

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

  /**
   * Client options from discord.js library
   */
  discordClientOptions: ClientOptions;
}

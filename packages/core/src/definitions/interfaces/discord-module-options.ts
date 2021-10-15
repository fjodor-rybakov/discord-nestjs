import { GuardType } from '../types/guard.type';
import { ClientOptions, WebhookClientData } from 'discord.js';
import { PipeType } from '../types/pipe.type';
import { Type } from '@nestjs/common';

export interface DiscordModuleOption {
  /**
   * Authorization token
   */
  token: string;

  /**
   * Command classes
   */
  commands?: (Type | string)[];

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
  webhook?: WebhookClientData;

  /**
   * Client options from discord.js library
   */
  discordClientOptions: ClientOptions;
}

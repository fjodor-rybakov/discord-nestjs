import { GuardType } from '../types/guard.type';
import { ClientOptions, WebhookClientData } from 'discord.js';
import { PipeType } from '../types/pipe.type';

export interface DiscordModuleOption {
  /**
   * Authorization token
   */
  token: string;

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

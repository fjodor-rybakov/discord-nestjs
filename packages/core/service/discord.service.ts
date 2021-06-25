import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Client, WebhookClient } from 'discord.js';
import { DiscordModuleOption } from '../interface/discord-module-option';
import { DiscordModuleCommandOptions } from '../interface/discord-module-command-options';
import { DiscordModuleWebhookOptions } from '../interface/discord-module-webhook-options';
import { PipeType } from '../util/type/pipe-type';
import { GuardType } from '../util/type/guard-type';
import { ModuleConstant } from '../constant/module.constant';

@Injectable()
export class DiscordService implements OnApplicationBootstrap {
  private readonly clientToken: string;
  private readonly commandPrefix: string;
  private readonly allowGuilds?: string[];
  private readonly denyGuilds?: string[];
  private readonly allowCommands?: DiscordModuleCommandOptions[];
  private readonly pipeList?: PipeType[];
  private readonly guardList?: GuardType[];

  private readonly client: Client;
  private readonly webhookClient: WebhookClient;
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    @Inject(ModuleConstant.DISCORD_MODULE_OPTIONS)
    options: DiscordModuleOption,
  ) {
    const {
      token,
      commandPrefix,
      allowGuilds,
      denyGuilds,
      allowCommands,
      webhook,
      usePipes,
      useGuards,
      ...discordOption
    } = options;
    this.client = new Client(discordOption);
    this.clientToken = token;
    this.commandPrefix = commandPrefix;
    this.allowGuilds = allowGuilds;
    this.denyGuilds = denyGuilds;
    this.allowCommands = allowCommands ?? [];
    this.webhookClient = this.createWebhookClient(webhook);
    this.pipeList = usePipes ?? [];
    this.guardList = useGuards ?? [];
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.client.login(this.clientToken);
    } catch (err) {
      this.logger.error('Failed to connect to Discord API');
      this.logger.error(err);
    }
  }

  getCommandPrefix(): string {
    return this.commandPrefix;
  }

  getAllowCommands(): DiscordModuleCommandOptions[] {
    return this.allowCommands;
  }

  getClient(): Client {
    return this.client;
  }

  getWebhookClient(): WebhookClient {
    return this.webhookClient;
  }

  getPipes(): PipeType[] {
    return this.pipeList;
  }

  getGuards(): GuardType[] {
    return this.guardList;
  }

  isAllowGuild(guildId: string): boolean {
    if (!this.allowGuilds) {
      return true;
    }
    return this.allowGuilds.includes(guildId);
  }

  isDenyGuild(guildId: string): boolean {
    if (!this.denyGuilds) {
      return false;
    }
    return this.denyGuilds.includes(guildId);
  }

  private createWebhookClient(
    webhookOptions: DiscordModuleWebhookOptions,
  ): WebhookClient {
    if (webhookOptions) {
      return new WebhookClient(
        webhookOptions.webhookId,
        webhookOptions.webhookToken,
      );
    }
  }
}

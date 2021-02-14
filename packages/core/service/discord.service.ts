import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Client, WebhookClient } from 'discord.js';
import { DiscordModuleOption } from '../interface/discord-module-option';
import { DiscordModuleChannelOptions } from '../interface/discord-module-channel-options';
import { DiscordModuleWebhookOptions } from '../interface/discord-module-webhook-options';

@Injectable()
export class DiscordService implements OnApplicationBootstrap {
  private readonly clientToken: string;
  private readonly commandPrefix: string;
  private readonly allowGuilds?: string[];
  private readonly denyGuilds?: string[];
  private readonly allowChannels?: DiscordModuleChannelOptions[];

  private readonly client: Client;
  private readonly webhookClient: WebhookClient;
  private readonly logger = new Logger(DiscordService.name);

  constructor(options: DiscordModuleOption) {
    const {
      token,
      commandPrefix,
      allowGuilds,
      denyGuilds,
      allowChannels,
      webhook,
      ...discordOption
    } = options;
    this.client = new Client(discordOption);
    this.clientToken = token;
    this.commandPrefix = commandPrefix;
    this.allowGuilds = allowGuilds;
    this.denyGuilds = denyGuilds;
    this.allowChannels = allowChannels ?? [];
    this.webhookClient = this.createWebhookClient(webhook);
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.client.login(this.clientToken);
    } catch (err) {
      this.logger.error("Failed to connect to Discord API");
      this.logger.error(err);
    }
  }

  getCommandPrefix(): string {
    return this.commandPrefix;
  }

  getAllowChannels(): DiscordModuleChannelOptions[] {
    return this.allowChannels;
  }

  getClient(): Client {
    return this.client;
  }

  getWebhookClient(): WebhookClient {
    return this.webhookClient;
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
    webhookOptions: DiscordModuleWebhookOptions
  ): WebhookClient {
    if (webhookOptions) {
      return new WebhookClient(
        webhookOptions.webhookId,
        webhookOptions.webhookToken,
      );
    }
  }
}
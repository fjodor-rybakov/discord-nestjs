import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Client, WebhookClient, WebhookClientData } from 'discord.js';

import { DiscordOptionService } from './discord-option.service';

@Injectable()
export class DiscordClientService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(DiscordClientService.name);
  private readonly webhookClient: WebhookClient;
  private readonly client: Client;
  private readonly clientToken: string;

  constructor(discordOptionService: DiscordOptionService) {
    const { token, webhook, discordClientOptions } =
      discordOptionService.getClientData();
    this.client = new Client(discordClientOptions);
    this.clientToken = token;
    this.webhookClient = this.createWebhookClient(webhook);
  }

  getClient(): Client {
    return this.client;
  }

  getWebhookClient(): WebhookClient {
    return this.webhookClient;
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.client.login(this.clientToken);
    } catch (err) {
      this.logger.error('Failed to connect to Discord API');
      this.logger.error(err);
    }
  }

  onApplicationShutdown(): void {
    this.client.destroy();
  }

  private createWebhookClient(
    webhookOptions: WebhookClientData,
  ): WebhookClient {
    if (!webhookOptions) return;

    return new WebhookClient(webhookOptions);
  }
}

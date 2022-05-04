import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Client, WebhookClient, WebhookClientData } from 'discord.js';

import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';
import { OptionService } from './option.service';

@Injectable()
export class ClientService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(ClientService.name);
  private webhookClient: WebhookClient;
  private client: Client;

  constructor(private discordOptionService: OptionService) {}

  init(options: DiscordModuleOption): void {
    this.discordOptionService.setDefault(options);

    const { token, webhook, discordClientOptions } =
      this.discordOptionService.getClientData();

    this.client = new Client(discordClientOptions);
    this.client.token = token;
    this.webhookClient = this.createWebhookClient(webhook);
  }

  getClient(): Client {
    return this.client;
  }

  getWebhookClient(): WebhookClient {
    return this.webhookClient;
  }

  async onApplicationBootstrap(): Promise<void> {
    if (!this.discordOptionService.getClientData().autoLogin) return;

    try {
      await this.client.login();
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

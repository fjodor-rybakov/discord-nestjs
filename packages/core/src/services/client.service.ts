import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Client, WebhookClient, WebhookClientData, ClientEvents, Interaction, CacheType } from 'discord.js';

import { SetupClientFactory } from '../definitions/interfaces/discord-module-async-options';
import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';
import { OptionService } from './option.service';

@Injectable()
export class ClientService
  implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(ClientService.name);
  private webhookClient: WebhookClient;
  private client: Client;
  private commmandHandlers: Map<string, (...eventArgs: ClientEvents['interactionCreate']) => Promise<void>> = new Map();

  constructor(private discordOptionService: OptionService) { }

  initClient(options: DiscordModuleOption): void {
    this.discordOptionService.updateOptions(options);

    const { token, webhook, discordClientOptions } =
      this.discordOptionService.getClientData();

    this.client = new Client(discordClientOptions);
    this.client.token = token;
    this.webhookClient = this.createWebhookClient(webhook);
  }

  getClient(): Client {
    return this.client;
  }

  async setupClient(setupFunction?: SetupClientFactory): Promise<void> {
    if (!setupFunction) return;

    await setupFunction(this.client);
  }

  getWebhookClient(): WebhookClient {
    return this.webhookClient;
  }

  addCommandHandler(commandName: string, handlerFunc: (...eventArgs: ClientEvents['interactionCreate']) => Promise<void>) {
    this.commmandHandlers.set(commandName, handlerFunc);
  }

  async onApplicationBootstrap(): Promise<void> {
    const { autoLogin, failOnLogin } =
      this.discordOptionService.getClientData();

    if (!autoLogin) return;

    try {
      await this.client.login();
      // Add executeCommands, theres probably a better place but its just POC
      this.client.on('interactionCreate', this.executeCommands)
    } catch (error) {
      this.logger.error('Failed to connect to Discord API');
      this.logger.error(error);

      if (failOnLogin) throw error;
    }
  }

  onApplicationShutdown(): void {
    const { shutdownOnAppDestroy } = this.discordOptionService.getClientData();

    if (shutdownOnAppDestroy) this.client.destroy();
  }

  private createWebhookClient(
    webhookOptions: WebhookClientData,
  ): WebhookClient {
    if (!webhookOptions) return;

    return new WebhookClient(webhookOptions);
  }

  private async executeCommands(...eventArgs: ClientEvents['interactionCreate']) {
    const [interaction] = eventArgs;
    if (
      (!interaction.isChatInputCommand() &&
        !interaction.isContextMenuCommand()) ||
      !this.commmandHandlers.has(interaction.commandName)
    ) {
      return;
    }
    try {
      await this.commmandHandlers.get(interaction.commandName)(...eventArgs)
    }
    catch {
      this.logger.error(`Failed to execute command: ${interaction.commandName}`)
    }
  }
}

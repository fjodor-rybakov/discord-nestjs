import { ClientProvider } from './interface/client-provider.interface';
import { Client, WebhookClient } from 'discord.js';
import { Injectable } from '@nestjs/common';
import { DiscordService } from '../service/discord.service';

@Injectable()
export class DiscordClientProvider implements ClientProvider {
  constructor(private readonly discordService: DiscordService) {}

  getClient(): Client {
    return this.discordService.getClient();
  }

  getWebhookClient(): WebhookClient {
    return this.discordService.getWebhookClient();
  }
}

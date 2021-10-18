import { DiscordClientService } from '../services/discord-client.service';
import { Injectable } from '@nestjs/common';
import { Client, WebhookClient } from 'discord.js';

@Injectable()
export class DiscordClientProvider {
  constructor(private readonly discordClientService: DiscordClientService) {}

  getClient(): Client {
    return this.discordClientService.getClient();
  }

  getWebhookClient(): WebhookClient {
    return this.discordClientService.getWebhookClient();
  }
}

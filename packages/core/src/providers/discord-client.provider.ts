import { Injectable } from '@nestjs/common';
import { Client, WebhookClient } from 'discord.js';

import { ClientService } from '../services/client.service';

@Injectable()
export class DiscordClientProvider {
  constructor(private readonly discordClientService: ClientService) {}

  getClient(): Client {
    return this.discordClientService.getClient();
  }

  getWebhookClient(): WebhookClient {
    return this.discordClientService.getWebhookClient();
  }
}

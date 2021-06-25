import { Client, WebhookClient } from 'discord.js';

export interface ClientProvider {
  /**
   * Discord.js client
   */
  getClient(): Client;

  /**
   * Discord.js webhook client
   */
  getWebhookClient(): WebhookClient;
}

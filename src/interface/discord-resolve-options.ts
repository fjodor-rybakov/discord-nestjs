import { DiscordClient } from '../discord-client';

export interface DiscordResolveOptions {
  instance: Record<string, any>;
  methodName: string;
  discordClient: DiscordClient;
}
